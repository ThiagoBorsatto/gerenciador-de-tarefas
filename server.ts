import express from "express";

const app = express();
const PORT = 3000;

// Middware para ler os corpo das requisições em formato JSON
app.use(express.json());

// Banco de Dados provisório em RAM
let bancoDeDadosProvisorio = [
    { id: 1, title: "Estudar arquitetura REST", status: "pendente" }
];

// Rota da tarefas (Tasks)
app.get("/api/tasks", (req, res) => {
    res.json(bancoDeDadosProvisorio);
});

// Criar nova tarefa (New Task)
app.post("/api/tasks", (req, res) => {
    const { title } = req.body;
    const novaTarefa = {
        id: Date.now(),
        title,
        status: "pendente"
    };
    bancoDeDadosProvisorio.push(novaTarefa);
    res.status(201).json(novaTarefa);
});


// Rota principal de FALLBACK
app.get("/",(req, res) => {
    res.json({ turma: "ADS-2025" });
});

// Rota de integridade do sistema (Health Check)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Servidor do Gestor de Tarefas ativo!" });
});

// Rota da versão do sistema (Version Check)
app.get("/api/version",(req, res) => {
    res.json({ appName: "Gerenciador de Tarefas Multi-Usuários", version: "1.0.0" });
});

app.listen(PORT, () => {
    console.log(`Servido rodando em: http://localhost:${PORT}`);
});