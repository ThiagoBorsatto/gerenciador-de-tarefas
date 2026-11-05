import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.use(cors());
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_desenvolvimento";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FRONT_DIST = path.join(__dirname, "web", "dist");
const FRONT_INDEX = path.join(FRONT_DIST, "index.html");

const SEM_BUILD = [
    "Ainda não existe o build do front-end.",
    "",
    "Procurei este arquivo:",
    `  ${FRONT_INDEX}`,
    "",
    "Gere-o com:",
    "  cd web",
    "  npm install",
    "  npm run build",
    "",
    "Enquanto isso, a API continua funcionando em /api/health.",
].join("\n");

function maisRecente(dir: string): number {
    let maior = 0;
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
        const caminho = path.join(dir, entrada.name);
        if (entrada.isDirectory()) {
            maior = Math.max(maior, maisRecente(caminho));
        } else {
            maior = Math.max(maior, fs.statSync(caminho).mtimeMs);
        }
    }
    return maior;
}

// ============================================================================
// Interfaces (atualizadas para a Aula 09)
// ============================================================================
interface Tarefa {
    id: number;
    usuario_id: number;
    titulo: string;
    descricao: string | null;
    status: "pending" | "completed";
    prioridade: "low" | "medium" | "high";
    criado_em: string;
    atualizado_em: string;
}

interface Usuario {
    id: number;
    email: string;
    senha_hash: string;
    criado_em: string;
}

interface AuthRequest extends Request {
    usuarioId?: number;
}

const PRIORIDADES = ["low", "medium", "high"] as const;
const STATUS_VALIDOS = ["pending", "completed"] as const;

const tituloValido = (t: unknown): t is string =>
    typeof t === "string" && t.trim().length >= 3;

const normalizarPrioridade = (p: unknown) => {
    const listaPrioridades = PRIORIDADES as readonly string[];
    return typeof p === "string" && listaPrioridades.includes(p) ? p : "medium";
};

const normalizarStatus = (s: unknown) => {
    const listaStatus = STATUS_VALIDOS as readonly string[];
    return typeof s === "string" && listaStatus.includes(s) ? s : "pending";
};

const parsearId = (idParam: string): number | null => {
    const id = Number(idParam);
    return isNaN(id) ? null : id;
};

app.use(express.json());

const ARQUIVO_ENV = path.join(__dirname, ".env");

function carregarEnv(): void {
    if (!fs.existsSync(ARQUIVO_ENV)) return;

    const bruto = fs.readFileSync(ARQUIVO_ENV);
    if (bruto.length >= 3 && bruto[0] === 0xef && bruto[1] === 0xbb && bruto[2] === 0xbf) {
        console.warn(
            "\n[ATENÇÃO] O seu .env foi salvo COM BOM (marca de bytes 0xEF 0xBB 0xBF).\n" +
            "          Consequência: a PRIMEIRA variável do arquivo é ignorada sem erro.\n" +
            "          Salve de novo em UTF-8 SEM BOM e confira se a primeira\n" +
            "          variável é mesmo a TURSO_URL.\n",
        );
    }
    process.loadEnvFile(ARQUIVO_ENV);
}

carregarEnv();

const TURSO_URL = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_TOKEN;

const usandoNuvem = Boolean(TURSO_URL && TURSO_TOKEN);
const MODO_BANCO = usandoNuvem ? "Turso / libSQL (nuvem)" : "arquivo local (SQLite)";

// Se houver URL e Token, conecta no Turso; senão, mantém arquivo local como fallback
const db = createClient({
    url: usandoNuvem ? TURSO_URL! : "file:./tarefas.db",
    authToken: usandoNuvem ? TURSO_TOKEN : undefined,
});

/**
 * Exibe no terminal o modo em que o banco está operando, sem adivinhações.
 */
function exibirBannerBanco(): void {
    console.log("============================================================");
    console.log("  Banco de dados");
    console.log("------------------------------------------------------------");
    console.log(`  Modo  : ${MODO_BANCO}`);
    console.log(`  Onde  : ${usandoNuvem ? TURSO_URL : path.resolve("tarefas.db")}`);
    console.log(`  Token : ${usandoNuvem ? "presente (nunca será mostrado)" : "não informado"}`);
    if (!usandoNuvem) {
        console.log("  Para usar o Turso, crie um arquivo .env na raiz com:");
        console.log("    TURSO_URL=libsql://seu-banco.turso.io");
        console.log("    TURSO_TOKEN=seu-token");
    }
    console.log("============================================================");
}

// ============================================================================
// LACUNA 6 — Estrutura das tabelas (um comando por constante)
// ============================================================================
const SQL_USUARIOS = `
    CREATE TABLE IF NOT EXISTS usuarios (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        email      TEXT NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        criado_em  DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

const SQL_TAREFAS = `
    CREATE TABLE IF NOT EXISTS tarefas (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id    INTEGER NOT NULL,
        titulo        TEXT NOT NULL,
        descricao     TEXT,
        status        TEXT NOT NULL DEFAULT 'pending',
        prioridade    TEXT NOT NULL DEFAULT 'medium',
        criado_em     DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )
`;

// ============================================================================
// LACUNA 7 — Prepara o banco antes de o servidor aceitar requisições
// ============================================================================
const ADMIN_EMAIL = "admin@senai.com";
const ADMIN_SENHA = "senha_super_secreta_123";

async function garantirColunaAtualizadoEm(): Promise<void> {
    // Bancos criados na Aula 08 não têm essa coluna; o ALTER falha se ela já existir
    try {
        await db.execute(
            "ALTER TABLE tarefas ADD COLUMN atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP",
        );
        console.log("  Coluna atualizado_em adicionada em tarefas.");
    } catch (erro: any) {
        if (!String(erro?.message).includes("duplicate column")) {
            console.warn("  Não consegui adicionar a coluna atualizado_em:", erro?.message);
        }
    }
}

async function garantirAdmin(): Promise<void> {
    const { rows } = await db.execute({
        sql: "SELECT id FROM usuarios WHERE email = ?",
        args: [ADMIN_EMAIL],
    });
    if (rows.length > 0) return;

    const hash = await bcrypt.hash(ADMIN_SENHA, 10);
    await db.execute({
        sql: "INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)",
        args: [ADMIN_EMAIL, hash],
    });
    console.log(`  Usuário padrão criado: ${ADMIN_EMAIL}`);
}

async function inicializarBanco(): Promise<void> {
    try {
        // execute() só roda o PRIMEIRO comando; batch() roda todos, numa transação
        await db.batch([SQL_USUARIOS, SQL_TAREFAS], "write");
        await garantirColunaAtualizadoEm();
        await garantirAdmin();
    } catch (erro: any) {
        console.error("\n[ERRO] Falha ao preparar o banco de dados.");
        console.error(`  Modo    : ${MODO_BANCO}`);
        console.error(`  Onde    : ${usandoNuvem ? TURSO_URL : path.resolve("tarefas.db")}`);
        console.error(`  Código  : ${erro?.code ?? "DESCONHECIDO"}`);
        console.error(`  Detalhe : ${erro?.message}`);
        if (usandoNuvem) {
            console.error("  Dica: o Turso responde 404 tanto para URL errada quanto para token errado.");
            console.error("        Confira se a URL começa com libsql:// e não termina com '/'.\n");
        }
        process.exit(1);
    }
}

// ============================================================================
// LACUNA 8 — Helpers de consulta (sempre com ? + args, nunca concatenando)
// ============================================================================
function primeiraLinha<T>(rows: unknown[]): T | undefined {
    return rows[0] as T | undefined;
}

const buscarUsuarioPorEmail = (email: string) =>
    db.execute({ sql: "SELECT * FROM usuarios WHERE email = ?", args: [email] });

const buscarUsuarioPorId = (id: number) =>
    db.execute({ sql: "SELECT id, email, criado_em FROM usuarios WHERE id = ?", args: [id] });

const inserirUsuario = (email: string, senhaHash: string) =>
    db.execute({
        sql: "INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)",
        args: [email, senhaHash],
    });

const listarTarefasDoUsuario = (usuarioId: number, search?: string) => {
    if (!search) {
        return db.execute({
            sql: "SELECT * FROM tarefas WHERE usuario_id = ? ORDER BY id DESC",
            args: [usuarioId],
        });
    }
    const termo = `%${search}%`;
    return db.execute({
        sql: `SELECT * FROM tarefas
              WHERE usuario_id = ? AND (titulo LIKE ? OR descricao LIKE ?)
              ORDER BY id DESC`,
        args: [usuarioId, termo, termo],
    });
};

const buscarTarefaPorIdEUsuario = (id: number, usuarioId: number) =>
    db.execute({
        sql: "SELECT * FROM tarefas WHERE id = ? AND usuario_id = ?",
        args: [id, usuarioId],
    });

const deletarTarefaPorIdEUsuario = (id: number, usuarioId: number) =>
    db.execute({
        sql: "DELETE FROM tarefas WHERE id = ? AND usuario_id = ?",
        args: [id, usuarioId],
    });

// Middleware de Autenticação (mantido da Aula 08)
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token ausente ou mal formatado." });
    }
    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: number };
        req.usuarioId = payload.id;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido ou expirado." });
    }
};

// ============================================================================
// LACUNA 9 — Health, cadastro e login (assíncronos)
// ============================================================================

// O front (web/src/api.ts) envia "senha"; o guia e o request.http usam "password".
// Aceitamos os dois para nenhum lado quebrar.
const lerSenha = (body: any): unknown => body?.senha ?? body?.password;

app.get("/api/health", async (_req: Request, res: Response) => {
    try {
        // Não basta o Express estar de pé: perguntamos algo ao banco de verdade
        await db.execute("SELECT 1");
        return res.json({ status: "ok", message: "Servidor do Gestor de Tarefas ativo!", banco: MODO_BANCO });
    } catch {
        return res.status(503).json({
            status: "erro",
            message: "O servidor está no ar, mas o banco de dados não respondeu.",
            banco: MODO_BANCO,
        });
    }
});

app.post("/api/auth/register", async (req: Request, res: Response) => {
    const email = req.body?.email;
    const senha = lerSenha(req.body);

    if (typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "E-mail inválido." });
    }
    if (typeof senha !== "string" || senha.length < 6) {
        return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);
        const resultado = await inserirUsuario(email.trim(), hash);
        // lastInsertRowid vem como bigint no libsql
        const id = Number(resultado.lastInsertRowid);
        return res.status(201).json({
            message: "Usuário cadastrado com sucesso!",
            user: { id, email: email.trim() },
        });
    } catch (erro: any) {
        // 409 só quando o UNIQUE do e-mail barrou; qualquer outra falha é do servidor
        if (String(erro?.code).startsWith("SQLITE_CONSTRAINT")) {
            return res.status(409).json({ error: "E-mail já cadastrado." });
        }
        return res.status(500).json({ error: "Não foi possível cadastrar agora. Tente de novo." });
    }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
    const email = req.body?.email;
    const senha = lerSenha(req.body);

    if (typeof email !== "string" || typeof senha !== "string" || !email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    let usuario: Usuario | undefined;
    try {
        const { rows } = await buscarUsuarioPorEmail(email.trim());
        usuario = primeiraLinha<Usuario>(rows);
    } catch {
        // Banco fora do ar NÃO é "senha errada": o usuário precisa saber a diferença
        return res.status(500).json({ error: "Não foi possível entrar agora. Tente de novo." });
    }

    const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senha_hash) : false;
    if (!usuario || !senhaConfere) {
        return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token });
});

app.get("/api/auth/me", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { rows } = await buscarUsuarioPorId(req.usuarioId!);
        const usuario = primeiraLinha<Omit<Usuario, "senha_hash">>(rows);
        if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });
        return res.json(usuario);
    } catch {
        return res.status(500).json({ error: "Erro ao buscar o usuário." });
    }
});

// Rotas de tarefas mantidas da Aula 08, adaptadas para assíncrono
app.get("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    const usuarioId = req.usuarioId!;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    try {
        const { rows } = await listarTarefasDoUsuario(usuarioId, search || undefined);
        return res.json(rows);
    } catch {
        return res.status(500).json({ error: "Erro interno ao processar a listagem." });
    }
});

app.post("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    const usuarioId = req.usuarioId!;
    const { titulo, prioridade } = req.body;
    const prioridadeValida = normalizarPrioridade(prioridade);
    if (!tituloValido(titulo)) {
        return res.status(400).json({
            error: "O título da tarefa é obrigatório e deve conter pelo menos 3 caracteres válidos."
        });
    }
    try {
        const resultado = await db.execute({
            sql: "INSERT INTO tarefas (titulo, status, prioridade, usuario_id) VALUES (?, 'pending', ?, ?)",
            args: [titulo.trim(), prioridadeValida, usuarioId],
        });
        const idInserido = Number(resultado.lastInsertRowid);
        const { rows } = await buscarTarefaPorIdEUsuario(idInserido, usuarioId);
        const novaTarefa = rows[0] as unknown as Tarefa;
        return res.status(201).json(novaTarefa);
    } catch {
        return res.status(500).json({ error: "Erro ao processar persistência" });
    }
});

app.delete("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    const usuarioId = req.usuarioId!;
    const idParaDeletar = parsearId(String(req.params.id));
    if (idParaDeletar === null) {
        return res.status(400).json({ error: "ID inválido." });
    }
    try {
        const resultado = await deletarTarefaPorIdEUsuario(idParaDeletar, usuarioId);
        if (resultado.rowsAffected === 0) {
            return res.status(404).json({ error: "Tarefa não localizada para exclusão." });
        }
        return res.json({ message: "Tarefa excluída com sucesso!" });
    } catch {
        return res.status(500).json({ error: "Erro interno ao processar a exclusão." });
    }
});

app.put("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    const usuarioId = req.usuarioId!;
    const idParaAtualizar = parsearId(String(req.params.id));
    if (idParaAtualizar === null) {
        return res.status(400).json({ error: "ID inválido." });
    }
    const { titulo, prioridade, status } = req.body;
    if (!tituloValido(titulo)) {
        return res.status(400).json({
            error: "O título da tarefa é obrigatório e deve conter pelo menos 3 caracteres válidos."
        });
    }
    const prioridadeValida = normalizarPrioridade(prioridade);
    const statusValido = normalizarStatus(status);
    try {
        const sql = "UPDATE tarefas SET titulo = ?, status = ?, prioridade = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ? AND usuario_id = ?";
        const resultado = await db.execute({
            sql,
            args: [titulo.trim(), statusValido, prioridadeValida, idParaAtualizar, usuarioId],
        });
        if (resultado.rowsAffected === 0) {
            return res.status(404).json({ message: "Tarefa não encontrada para atualização!" });
        }
        const { rows } = await buscarTarefaPorIdEUsuario(idParaAtualizar, usuarioId);
        const tarefaAtualizada = rows[0] as unknown as Tarefa;
        return res.status(200).json(tarefaAtualizada);
    } catch {
        return res.status(500).json({ error: "Erro ao processar a atualização no banco de dados." });
    }
});

app.patch("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    const usuarioId = req.usuarioId!;
    const idParaAtualizar = parsearId(String(req.params.id));
    if (idParaAtualizar === null) {
        return res.status(400).json({ error: "ID inválido." });
    }
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Nenhum campo fornecido para atualização." });
    }
    const { titulo, prioridade, status } = req.body;
    try {
        const { rows: rowsExistente } = await buscarTarefaPorIdEUsuario(idParaAtualizar, usuarioId);
        const tarefaExistente = rowsExistente[0] as unknown as Tarefa | undefined;
        if (!tarefaExistente) {
            return res.status(404).json({ error: "Tarefa não encontrada para atualização!" });
        }

        const camposParaAtualizar: string[] = [];
        const valoresParaAtualizar: unknown[] = [];

        if (titulo !== undefined) {
            if (!tituloValido(titulo)) {
                throw new Error("O título da tarefa deve conter pelo menos 3 caracteres válidos.");
            }
            camposParaAtualizar.push("titulo = ?");
            valoresParaAtualizar.push(titulo.trim());
        }
        if (prioridade !== undefined) {
            if (!PRIORIDADES.includes(prioridade as typeof PRIORIDADES[number])) {
                throw new Error("Prioridade inválida. Use 'low', 'medium' ou 'high'.");
            }
            camposParaAtualizar.push("prioridade = ?");
            valoresParaAtualizar.push(prioridade);
        }
        if (status !== undefined) {
            if (!STATUS_VALIDOS.includes(status as typeof STATUS_VALIDOS[number])) {
                throw new Error("Status inválido. Use 'pending' ou 'completed'.");
            }
            camposParaAtualizar.push("status = ?");
            valoresParaAtualizar.push(status);
        }
        if (camposParaAtualizar.length === 0) {
            return res.status(200).json(tarefaExistente);
        }
        const sql = `UPDATE tarefas SET ${camposParaAtualizar.join(", ")} WHERE id = ? AND usuario_id = ?`;
        valoresParaAtualizar.push(idParaAtualizar, usuarioId);

        await db.execute({ sql, args: valoresParaAtualizar as any[] });

        const { rows } = await buscarTarefaPorIdEUsuario(idParaAtualizar, usuarioId);
        return res.status(200).json(rows[0] as unknown as Tarefa);
    } catch (erro) {
        if (erro instanceof Error && (erro.message.includes("inválid") || erro.message.includes("caracteres"))) {
            return res.status(400).json({ error: erro.message });
        }
        return res.status(500).json({ error: "Erro ao processar a atualização parcial no banco." });
    }
});

// ============================================================================
// LACUNA 10 — Front-end: 404 da API, arquivos estáticos e SPA fallback
// ============================================================================

// Tem que vir ANTES do fallback, senão /api/qualquer-coisa devolveria o index.html
app.use("/api", (_req: Request, res: Response) => {
    res.status(404).json({ error: "Rota de API não encontrada." });
});

app.use(express.static(FRONT_DIST));

// Qualquer outra rota (ex: /tarefas) é do React Router: entregamos o index.html
app.get(/(.*)/, (_req: Request, res: Response) => {
    if (!fs.existsSync(FRONT_INDEX)) {
        return res.status(503).type("text/plain").send(SEM_BUILD);
    }
    return res.sendFile(FRONT_INDEX);
});

/** Avisa no terminal se o build não existe ou é mais velho que o código em web/src. */
function verificarFront(): void {
    if (!fs.existsSync(FRONT_INDEX)) {
        console.warn("\n[AVISO] " + SEM_BUILD.replace(/\n/g, "\n        ") + "\n");
        return;
    }
    const pastaFonte = path.join(__dirname, "web", "src");
    if (!fs.existsSync(pastaFonte)) return;

    if (maisRecente(pastaFonte) > maisRecente(FRONT_DIST)) {
        console.warn("\n[AVISO] web/src mudou depois do último build; o navegador vai mostrar a versão antiga.");
        console.warn("        Rode: cd web && npm run build\n");
    }
}

// ============================================================================
// LACUNA 11 — Inicialização do servidor
// ============================================================================
async function iniciarServidor(): Promise<void> {
    // Primeiro o banco; só depois abrimos a porta para receber requisições
    await inicializarBanco();

    app.listen(PORT, () => {
        exibirBannerBanco();
        console.log(`Servidor rodando em: http://localhost:${PORT}`);
        console.log(`API:   http://localhost:${PORT}/api/health`);
        console.log(`Front: http://localhost:${PORT}`);
        verificarFront();
    });
}

iniciarServidor();
