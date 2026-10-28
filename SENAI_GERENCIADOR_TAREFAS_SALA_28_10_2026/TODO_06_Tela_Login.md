# Plano de Ações — Aula 06: Tela de Login e Registro no React

> Origem: `06_tela_login.docx`
> Pré-requisito: Aula 05 (Introdução ao React) — **concluída e confirmada no projeto** (`web/` criado, CORS ativo no `server.ts`, fetch para `/api/health` funcionando).
> Estado atual: `web/` é o projeto da Aula 05 (sem Tailwind, sem `api.ts`, sem `Login.tsx`; `App.tsx` na versão da Aula 05). O `server.ts` **contém os 3 erros reais** que o documento manda corrigir (seção 10).
> ⚠️ **Nota de correção (22/10/2026):** as seções 6, 7 e 8 **agora contêm o código FINAL completo** (antes usavam esqueletos com `{ ... }`, que não compilam). Regra deste MD: todo bloco rotulado "Depois" é para copiar e colar integralmente; nunca existe `...` como corpo de função.

---

## 1. Conferência inicial e dependências (terminal)

1. **Arquivo:** Não é edição — é conferência e `npm install` em dois terminais.
2. **Local no arquivo:** Terminal 1 na raiz da aula (onde estão `server.ts` e `package.json`); Terminal 2 dentro de `web/`.
3. **Antes / Depois (comandos):**
   ```bash
   # Terminal 1 — back-end (na raiz)
   npm install
   npm run dev
   # Deve aparecer: Servidor rodando em: http://localhost:3000
   # Este terminal fica ocupado; por isso precisamos do segundo.

   # Terminal 2 — front-end
   cd web
   npm install
   ```
   - Neste projeto, a conferência já indica: `package.json`, `server.ts`, `request.http` e `web/` **já estão presentes** (sem necessidade de copiar nada — a pasta `20261014_tela_login` mencionada no documento é para quem começa de uma cópia).
   - Nunca copiar `node_modules` — ele é regenerado pelo `npm install`.
4. **Explicação didática:** Cada aula parte do estado da anterior: o backend (`server.ts` com JWT e CRUD protegido) e o front (`web/`) já provaram que conversam na Aula 05. Antes de escrever código novo, garantimos que as dependências instaláveis (o conteúdo do `package.json`) estão realmente presentes na máquina — afinal, `node_modules` nunca viaja junto com o projeto. O backend precisa ficar rodando o tempo todo num terminal dedicado, pois a partir de agora o front vai fazer requisições reais de login e registro nele; daí a necessidade dos dois terminais lado a lado.

---

## 2. Instalar o Tailwind CSS (terminal)

1. **Arquivo:** Os comandos atualizam automaticamente `web/package.json` (devDependencies).
2. **Local no arquivo:** Terminal 2, dentro de `web/`.
3. **Antes / Depois:**
   - Antes (`web/package.json` → `devDependencies`): sem Tailwind (confirmado).
   - Depois (executar):
     ```bash
     npm install -D tailwindcss @tailwindcss/vite
     ```
   - Depois (`web/package.json` → resultado esperado em `devDependencies`):
     ```json
     "tailwindcss": "^4.x.x",
     "@tailwindcss/vite": "^4.x.x"
     ```
4. **Explicação didática:** O Tailwind CSS é o framework que substitui os arquivos de CSS à mão por "classe por classe" direto no JSX (na Aula 05 ainda não precisávamos dele porque a tela era mínima). A partir de hoje, **todas** as telas do projeto (login, lista de tarefas, exclusão) vão usar o mesmo tema escuro e as mesmas classes — por isso instalamos uma única vez, agora. A flag `-D` marca como dependência **de desenvolvimento**: são ferramentas que montam o CSS durante o build, e não bibliotecas que chegam ao usuário final — por isso ficam em `devDependencies`, e não em `dependencies`.

---

## 3. Ligar o Tailwind no Vite

1. **Arquivo:** `web/vite.config.ts`.
2. **Local no arquivo:** Todo o conteúdo (import no topo + lista de plugins).
3. **Antes / Depois:**
   - **Antes** (conteúdo atual, original do template):
     ```ts
     import react from '@vitejs/plugin-react'
     import { defineConfig } from 'vite'

     // https://vite.dev/config/
     export default defineConfig({
       plugins: [react()],
     })
     ```
   - **Depois** (substituir todo o conteúdo por):
     ```ts
     import tailwindcss from '@tailwindcss/vite'
     import react from '@vitejs/plugin-react'
     import { defineConfig } from 'vite'

     // https://vite.dev/config/
     export default defineConfig({
       plugins: [react(), tailwindcss()],
     })
     ```
4. **Explicação didática:** O Vite funciona com plugins — módulos que ensinam o servidor de desenvolvimento a lidar com uma tecnologia nova. Aqui importamos o plugin do Tailwind e o adicionamos à lista `plugins`, junto ao do React (que já existia). Sem essa linha, o Vite ignoraria completamente as classes Tailwind do nosso JSX: `bg-blue-600` viraria só um texto inofensivo no atributo `className`. É o "interruptor" que liga o framework ao pipeline de build.

---

## 4. Dizer ao Tailwind onde ele age

1. **Arquivo:** `web/src/index.css`.
2. **Local no arquivo:** Todo o conteúdo (substituição completa).
3. **Antes / Depois:**
   - **Antes** (conteúdo atual = CSS padrão do template Vite, com as variáveis `:root`, `#root` com borda lateral, estilos de `h1`/`h2`, etc. — 111 linhas de estilo da página de demonstração).
   - **Depois** (apagar tudo e deixar apenas):
     ```css
     /* Tailwind CSS v4 - o ponto de entrada do framework.
        O Tailwind v4 usa configuracao via CSS: nao existe mais tailwind.config.js.
        Basta importar "tailwindcss" aqui e usar as classes utilitarias direto no JSX. */
     @import "tailwindcss";

     /* O tema escuro e o cenario base do projeto. Declaramos o fundo e a cor
        do texto no proprio elemento <body> para que toda a tela nasca escura. */
     body {
       background-color: var(--color-slate-950);
       color: var(--color-slate-100);
     }

     /* Acessibilidade: respeita quem desligou as animacoes no sistema. */
     @media (prefers-reduced-motion: reduce) {
       *,
       *::before,
       *::after {
         animation-duration: 0.01ms !important;
         transition-duration: 0.01ms !important;
       }
     }
     ```
   - Três pontos-chave do documento: (1) `@import "tailwindcss"` é o que liga o framework — sem essa linha o arquivo fica em branco; (2) o Tailwind **v4 não usa mais `tailwind.config.js`** — a configuração é escrita no próprio CSS; (3) o `body` já nasce escuro, então nenhuma tela precisa repetir a cor.
4. **Explicação didática:** O `@import "tailwindcss"` é a "porta de entrada" do framework: ele injeta as centenas de classes utilitárias (`flex`, `p-4`, `text-white`...) que o plugin do Vite vai detectar e compilar sob demanda. As variáveis `--color-slate-950` e `--color-slate-100` são definidas pelo próprio Tailwind (a escala de cinzas), e aplicá-las ao `body` cria o cenário escuro global de uma vez — o restante do CSS da página de demonstração do Vite vira inútil e sai fora. A regra de acessibilidade final é uma gentileza com usuários que configuraram o sistema para reduzir animações.

---

## 5. Ajustar o `index.html`

1. **Arquivo:** `web/index.html`.
2. **Local no arquivo:** Todo o conteúdo (substituição completa).
3. **Antes / Depois:**
   - **Antes** (conteúdo atual):
     ```html
     <!doctype html>
     <html lang="pt-BR">
       <head>
         <meta charset="UTF-8" />
         <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <title>web</title>
       </head>
       <body>
         <div id="root"></div>
         <script type="module" src="/src/main.tsx"></script>
       </body>
     </html>
     ```
   - **Depois** (substituir todo o conteúdo por):
     ```html
     <!doctype html>
     <html lang="pt-BR" class="dark">
       <head>
         <meta charset="UTF-8" />
         <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <title>Gerenciador de Tarefas</title>
       </head>
       <body>
         <div id="root"></div>
         <script type="module" src="/src/main.tsx"></script>
       </body>
     </html>
     ```
   - Alterações: `lang="pt-BR"` (site em português), `<title>` "Gerenciador de Tarefas" (era "web") e `class="dark"` marcando o documento como tema escuro.
4. **Explicação didática:** O `index.html` é a única página HTML real de uma aplicação React — o JS todo é injetado na `div#root`. Os ajustes são pequenos mas visíveis: leitores de tela e tradutores passam a tratar o conteúdo como português (`lang="pt-BR"`), a aba do navegador ganha o nome correto, e a classe `dark` na raiz sinaliza o tema escuro para ferramentas que respeitam essa convenção. **Teste rápido do documento:** salve e recarregue — a tela deve ficar escura (fundo slate-950) mesmo com o `App.tsx` antigo; se ficar branca, o Tailwind não foi ligado (volte às seções 2 e 3 aqui do plano).

---

## 6. Criar a ponte com o back-end — `web/src/api.ts`

1. **Arquivo:** `web/src/api.ts` (**arquivo novo** — não existe).
2. **Local no arquivo:** Pasta `web/src/`, ao lado de `App.tsx` e `main.tsx`.
3. **Antes / Depois:**
   - **Antes:** o arquivo não existe — hoje o `fetch` está escrito dentro do componente `App.tsx`, sem token, sem padronização de erro e sem CRUD.
   - **Depois** (criar o arquivo e colar todo o conteúdo abaixo — **é o código final, não um esqueleto: os corpos das funções são completos e compiláveis**):
     ```ts
     /**
      * api.ts — a ponte entre o front-end (React) e a nossa API (server.ts).
      *
      * Este arquivo é o ÚNICO lugar do front que conhece o endereço da API.
      * Se um dia a porta mudar (3000 -> 4000), ou a API subir para a nuvem,
      * você mexe em UMA linha aqui e o resto do projeto continua funcionando.
      *
      * Organização do arquivo:
      *   1. Tipos          — o "contrato" de dados que o back devolve
      *   2. Token (JWT)    — guardar, ler e apagar a credencial do usuário
      *   3. Tratar resposta— transformar a resposta HTTP em dado ou erro
      *   4. Autenticação   — login e registro
      *   5. Tarefas        — as chamadas do CRUD (preparadas para a Aula 07)
      */

     // ---------------------------------------------------------------------------
     // 1. Endereço da API e tipos de dados
     // ---------------------------------------------------------------------------

     // Endereço do back-end. Em produção isso vira uma variável de ambiente.
     const API_BASE = "http://localhost:3000";

     // Chave usada no localStorage para guardar o token. Com um prefixo nosso,
     // para não colidir com nada de outro projeto na mesma máquina.
     const TOKEN_KEY = "gestor:token";

     /** O que a API devolve em /api/auth/login. */
     export interface AuthResult {
       token: string;
     }

     /** O que a API devolve em /api/auth/register. */
     export interface RegistroResult {
       id: number;
       email: string;
     }

     /** O usuário logado, reconstruído a partir do token. */
     export interface Usuario {
       id: number;
       email: string;
     }

     /** Uma tarefa, exatamente como a tabela `tarefas` do SQLite. */
     export interface Tarefa {
       id: number;
       titulo: string;
       status: "pending" | "completed";
       prioridade: "low" | "medium" | "high";
     }

     // ---------------------------------------------------------------------------
     // 2. Token (JWT) — guardar, ler e apagar a credencial
     // ---------------------------------------------------------------------------

     /** Salva o token que o back entregou no login. */
     export const setToken = (token: string): void => {
       localStorage.setItem(TOKEN_KEY, token);
     };

     /** Recupera o token salvo, ou null se o usuário nunca entrou. */
     export const getToken = (): string | null => {
       return localStorage.getItem(TOKEN_KEY);
     };

     /** Apaga o token. É isso que o botão "Sair" vai chamar (logout). */
     export const clearToken = (): void => {
       localStorage.removeItem(TOKEN_KEY);
     };

     /**
      * Monta os cabeçalhos das requisições, já com o token quando existir.
      *
      * É o mesmo formato que o middleware `authenticate` do server.ts exige:
      * o header precisa começar com a palavra "Bearer", um espaço, e o token.
      */
     export const authHeaders = (): Record<string, string> => {
       const token = getToken();
       return {
         "Content-Type": "application/json",
         ...(token ? { Authorization: `Bearer ${token}` } : {}),
       };
     };

     // ---------------------------------------------------------------------------
     // 3. Tratar resposta — transformar HTTP em dado ou em erro
     // ---------------------------------------------------------------------------

     /**
      * Lê a resposta e devolve os dados quando deu certo; quando deu errado,
      * lança um Error com a mensagem que o servidor preparou.
      *
      * Por que lançar em vez de "devolver null"?
      * Assim o `catch` do componente já funciona, sem precisar checar dois casos.
      */
     const tratarResposta = async <T,>(res: Response): Promise<T> => {
       const texto = await res.text();

       // Nem toda resposta devolve JSON (ex.: o DELETE responde só com mensagem).
       // Se o corpo não for JSON válido, deixamos `dados` como null e seguimos.
       let dados: unknown;
       try {
         dados = texto ? JSON.parse(texto) : null;
       } catch {
         dados = null;
       }

       if (!res.ok) {
         // O back sempre manda { error: "..." } nas falhas: aproveitamos a mensagem.
         const mensagem =
           (dados as { error?: string } | null)?.error ??
           `Falha na requisição (HTTP ${res.status}).`;
         throw new Error(mensagem);
       }

       return dados as T;
     };

     // ---------------------------------------------------------------------------
     // 4. Autenticação
     // ---------------------------------------------------------------------------

     /**
      * Descobre quem está logado, decodificando o token.
      *
      * IMPORTANTE: decodificar NÃO é validar.
      * O token é um JWT: a parte do meio é o conteúdo (payload) em Base64Url,
      * legível por qualquer pessoa. A assinatura é que prova que o servidor
      * emitiu aquilo — e essa prova só o back pode fazer.
      * Por isso usamos isso APENAS para mostrar o nome/e-mail na tela.
      * Quem decide se o acesso é permitido continua sendo o server.ts.
      *
      * Se o token estiver corrompido ou vencido, devolvemos null e limpamos
      * o storage, para o app voltar para a tela de login sozinho.
      */
     export const getUsuario = (): Usuario | null => {
       const token = getToken();
       if (!token) return null;

       // Um JWT tem 3 partes separadas por ponto: cabecalho . payload . assinatura
       const partes = token.split(".");
       if (partes.length !== 3) {
         clearToken();
         return null;
       }

       try {
         // O payload usa Base64Url, que troca + por - e / por _.
         // Precisamos voltar ao Base64 "normal" antes de decodificar.
         const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");

         // atob devolve bytes; montamos a string %XX para respeitar UTF-8
         // (assim acentos como "joão" não viram lixo).
         const binario = atob(base64);
         const percentEncoded = binario
           .split("")
           .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
           .join("");
         const payload: unknown = JSON.parse(decodeURIComponent(percentEncoded));

         // Usamos o token apenas como fonte de EXIBIÇÃO, nunca de autorização.
         const dados = payload as { id?: number; email?: string; exp?: number };
         if (typeof dados?.id !== "number" || typeof dados?.email !== "string") {
           clearToken();
           return null;
         }

         // O server.ts gera o token com 2h de validade (`expiresIn: "2h"`).
         // Checar o exp evita deixar a tela "logada" com um token morto.
         if (typeof dados.exp === "number" && dados.exp * 1000 < Date.now()) {
           clearToken();
           return null;
         }

         return { id: dados.id, email: dados.email };
       } catch {
         clearToken();
         return null;
       }
     };

     /**
      * POST /api/auth/login
      * Recebe e-mail e senha; se estiver certo, devolve o token e já o guarda.
      */
     export const login = async (email: string, senha: string): Promise<AuthResult> => {
       const res = await fetch(`${API_BASE}/api/auth/login`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, senha }),
       });

       const dados = await tratarResposta<AuthResult>(res);
       setToken(dados.token); // guarda o JWT no localStorage
       return dados;
     };

     /**
      * POST /api/auth/register
      * Cria a conta. Ainda NÃO loga: quem faz isso é o login, chamado em seguida.
      */
     export const registrar = async (
       email: string,
       senha: string,
     ): Promise<RegistroResult> => {
       const res = await fetch(`${API_BASE}/api/auth/register`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email, senha }),
       });

       return await tratarResposta<RegistroResult>(res);
     };

     // ---------------------------------------------------------------------------
     // 5. Tarefas — o CRUD, já pronto para a Aula 07
     // ---------------------------------------------------------------------------

     /** GET /api/tasks?search=... — lista as tarefas do usuário logado. */
     export const listarTarefas = async (search = ""): Promise<Tarefa[]> => {
       const url = `${API_BASE}/api/tasks${
         search ? `?search=${encodeURIComponent(search)}` : ""
       }`;
       const res = await fetch(url, { headers: authHeaders() });
       return await tratarResposta<Tarefa[]>(res);
     };

     /** POST /api/tasks — cria uma tarefa. */
     export const criarTarefa = async (
       titulo: string,
       prioridade: Tarefa["prioridade"],
     ): Promise<Tarefa> => {
       const res = await fetch(`${API_BASE}/api/tasks`, {
         method: "POST",
         headers: authHeaders(),
         body: JSON.stringify({ titulo, prioridade }),
       });
       return await tratarResposta<Tarefa>(res);
     };

     /** PATCH /api/tasks/:id — atualiza só os campos enviados. */
     export const atualizarTarefa = async (
       id: number,
       dados: Partial<Pick<Tarefa, "titulo" | "status" | "prioridade">>,
     ): Promise<Tarefa> => {
       const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
         method: "PATCH",
         headers: authHeaders(),
         body: JSON.stringify(dados),
       });
       return await tratarResposta<Tarefa>(res);
     };

     /** DELETE /api/tasks/:id — remove a tarefa. */
     export const deletarTarefa = async (id: number): Promise<{ message: string }> => {
       const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
         method: "DELETE",
         headers: authHeaders(),
       });
       return await tratarResposta<{ message: string }>(res);
     };
     ```
   - ⚠️ **Detalhe obrigatório:** no arquivo `.ts` (não `.tsx`), a assinatura do `tratarResposta` exige a vírgula: `<T,>` — sem ela o TypeScript acha que `<T>` abre uma tag JSX e dá erro de sintaxe.
4. **Explicação didática:** Este é o arquivo mais importante da aula: ele concentra em um único lugar toda a comunicação com o back-end — o endereço da API, o token, o tratamento de erro e as chamadas do CRUD. Se um dia a porta mudar (3000 → 4000) ou a API subir para a nuvem, altera-se uma linha e o projeto inteiro continua funcionando (a Aula 05 até antecipou este formato). Duas lições embutidas: o `tratarResposta` **lança** um `Error` com a mensagem pronta do servidor (em vez de devolver `null`) para o `catch` do componente funcionar sem checar dois casos; e `getUsuario()` decodifica o payload do JWT (Base64Url → `atob` → percent-encoding para acentos → checagem de `exp`) apenas **para exibir** o e-mail — **decodificar não é validar**: quem decide o acesso é o `server.ts`, que confere a assinatura. `login` chama `setToken` por dentro, salvando o JWT no `localStorage` (chave `gestor:token`, com prefixo para não colidir com outros projetos).

---

## 7. Criar a tela — `web/src/Login.tsx`

1. **Arquivo:** `web/src/Login.tsx` (**arquivo novo** — não existe).
2. **Local no arquivo:** Pasta `web/src/`.
3. **Antes / Depois:**
   - **Antes:** não existe — a tela de login ainda não foi construída.
   - **Depois** (criar o arquivo e colar todo o conteúdo abaixo — **código final completo, incluindo o JSX**):
     ```tsx
     /**
      * Login.tsx — a tela de login/registro.
      *
      * Um único componente atende os dois casos. O estado `modo` decide se o
      * botão principal chama /api/auth/register ou /api/auth/login, e se o
      * texto diz "Entrar" ou "Criar conta".
      */

     import { useState } from "react";
     import { login, registrar } from "./api";

     /** O que o App precisa saber: o login deu certo. */
     interface LoginProps {
       aoLogar: () => void;
     }

     /** Os dois modos da tela. O TypeScript impede trocarmos por engano. */
     type Modo = "login" | "registro";

     export default function Login({ aoLogar }: LoginProps) {
       // O que o usuário está digitando agora.
       const [email, setEmail] = useState("");
       const [senha, setSenha] = useState("");

       // Qual tela estamos exibindo: login ou registro.
       const [modo, setModo] = useState<Modo>("login");

       // feedbacks da requisição
       const [erro, setErro] = useState("");
       const [carregando, setCarregando] = useState(false);

       /**
        * Regras de negócio que o back também exige.
        * Validar aqui não substitui a validação do servidor (o back sempre
        * valida de novo) — serve só para dar um retorno rápido e amigável.
        */
       const validar = (): string => {
         if (!email.trim()) return "Informe o e-mail.";
         // A presença do @ é o mínimo esperado para um e-mail.
         if (!email.includes("@")) return "Informe um e-mail válido.";

         if (!senha) return "Informe a senha.";
         // O server.ts exige 6 caracteres no registro (POST /api/auth/register).
         if (modo === "registro" && senha.length < 6) {
           return "A senha deve ter pelo menos 6 caracteres.";
         }
         return "";
       };

       /**
        * O que acontece ao apertar o botão principal.
        * `async` porque envolve fetch (uma Promise). Por isso o `try/catch`.
        */
       const enviar = async (e: React.FormEvent) => {
         // Sem isso, o browser recarregaria a página e perderíamos todo o estado.
         e.preventDefault();

         setErro("");

         // Conferimos as regras antes de gastar uma ida ao servidor.
         const problema = validar();
         if (problema) {
           setErro(problema);
           return; // não segue para o fetch
         }

         setCarregando(true);

         try {
           if (modo === "login") {
             await login(email.trim(), senha);
           } else {
             // Primeiro cria a conta...
             await registrar(email.trim(), senha);
             // ...e só então entra com ela, para o usuário não ter que digitar de novo.
             await login(email.trim(), senha);
           }

           // Deu certo: avisamos o App, que vai trocar a tela.
           aoLogar();
         } catch (err) {
           // A mensagem veio pronta do back (ex.: "E-mail já cadastrado.").
           setErro(err instanceof Error ? err.message : "Falha ao autenticar.");
         } finally {
           // Roda tanto no sucesso quanto no erro: destrava o botão.
           setCarregando(false);
         }
       };

       const ehLogin = modo === "login";

       return (
         <div className="flex min-h-screen items-center justify-center px-4">
           <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
             <h1 className="text-center text-2xl font-bold tracking-tight text-white">
               Gerenciador de Tarefas
             </h1>
             <p className="mt-2 text-center text-sm text-slate-400">
               {ehLogin ? "Entre para continuar" : "Crie sua conta para começar"}
             </p>

             <form onSubmit={enviar} className="mt-8 flex flex-col gap-4">
               <div className="flex flex-col gap-1">
                 <label htmlFor="email" className="text-sm font-medium text-slate-300">
                   E-mail
                 </label>
                 <input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="voce@email.com"
                   autoComplete="email"
                   required
                   className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                 />
               </div>

               <div className="flex flex-col gap-1">
                 <label htmlFor="senha" className="text-sm font-medium text-slate-300">
                   Senha
                 </label>
                 <input
                   id="senha"
                   type="password"
                   value={senha}
                   onChange={(e) => setSenha(e.target.value)}
                   placeholder={ehLogin ? "Sua senha" : "Mínimo de 6 caracteres"}
                   // O teclado do celular oferece o campo certo para cada caso.
                   autoComplete={ehLogin ? "current-password" : "new-password"}
                   required
                   className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                 />
               </div>

               {/* Mensagem de erro. role="alert" faz o leitor de tela anunciar. */}
               {erro && (
                 <p
                   role="alert"
                   className="rounded-md border border-red-900 bg-red-950/60 px-3 py-2 text-sm text-red-300"
                 >
                   {erro}
                 </p>
               )}

               <button
                 type="submit"
                 disabled={carregando}
                 className="rounded-md bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
               >
                 {carregando ? "Aguarde..." : ehLogin ? "Entrar" : "Criar conta"}
               </button>
             </form>

             {/* type="button" é obrigatório aqui: dentro de um <form>, um button
                 sem type vira "submit" e recarregaria a página. */}
             <button
               type="button"
               onClick={() => {
                 setModo(ehLogin ? "registro" : "login");
                 setErro(""); // troca de modo sem deixar erro antigo na tela
               }}
               className="mt-4 w-full text-sm text-slate-400 transition hover:text-white"
             >
               {ehLogin ? "Não tem conta? Registre-se" : "Já tem conta? Entrar"}
             </button>
           </div>
         </div>
       );
     }
     ```
4. **Explicação didática:** O truque central é o estado `modo`: quando vale `"login"` o botão chama `/api/auth/login`; quando vale `"registro"`, chama `/api/auth/register` — **um único componente atende as duas telas**, sem duplicação. Quatro detalhes valiosos: (1) `e.preventDefault()` é obrigatório no `onSubmit`, senão o navegador recarrega a página e apaga todo o estado React; (2) `validar()` duplica as regras do backend apenas para retorno rápido e amigável — quem valida de verdade (segurança) é sempre o servidor; (3) o `try/catch/finally`: o `finally` destrava o botão (`setCarregando(false)`) tanto no sucesso quanto no erro — sem ele, um erro deixaria o botão travado para sempre; (4) o botão que troca de modo precisa de `type="button"` porque, dentro de um `<form>`, um `<button>` sem `type` vira submit e recarregaria a página. Público alvo da mensagem de erro: ela vem pronta do backend (ex.: "E-mail já cadastrado." — 409; "Credenciais inválidas." — 401).

---

## 8. Ligar tudo no App — `web/src/App.tsx`

1. **Arquivo:** `web/src/App.tsx`.
2. **Local no arquivo:** Todo o conteúdo (substituição completa).
3. **Antes / Depois:**
   - **Antes** (versão atual, da Aula 05 — contador + fetch de `/api/health`):
     ```tsx
     import { useState, useEffect } from "react";

     function Saudacao() {
       return <h1>Olá, turma! Minha primeira interface!</h1>;
     }

     export default function App() {
       const [n, setN] = useState(0);
       const [mensagem, setMensagem] = useState("Carregando...");

       useEffect(() => {
         fetch("http://localhost:3000/api/health")
           .then(res => res.json())
           .then(data => {
             console.log("Dados recebidos do back-end:", data);
             setMensagem("Conexão estabelecida com sucesso!");
           })
           .catch(err => setMensagem("Erro ao conectar com o servidor"));
       }, []);

       return (
         <div>
           <Saudacao />
           <hr />
           <h2>Contador interativo</h2>
           <button onClick={() => setN(n + 1)}>
             Cliquei {n} vezes
           </button>
           <hr />
           <h2>Status do Servidor</h2>
           <p>{mensagem}</p>
         </div>
       );
     }
     ```
   - **Depois** (apagar tudo e colar todo o conteúdo abaixo — **código final completo**):
     ```tsx
     /**
      * App.tsx — o "cerebro" da aplicação: decide qual tela mostrar.
      *
      * Hoje existem dois estados possíveis:
      *   - deslogado -> mostra o <Login />
      *   - logado    -> mostra o placeholder que será a lista de tarefas (Aula 07)
      */

     import { useState } from "react";
     import Login from "./Login";
     import { clearToken, getUsuario, type Usuario } from "./api";

     export default function App() {
       /**
        * O useState recebe uma FUNÇÃO como valor inicial. O React entende que
        * aquilo é uma "fábrica" e a chama uma única vez, já no primeiro render.
        *
        * Por que não getUsuario() direto? Porque a cada re-render o array
        * [usuario, setUsuario] é recriado. Se chamássemos direto, o token seria
        * lido e decodificado a cada tecla digitada na tela.
        */
       const [usuario, setUsuario] = useState<Usuario | null>(() => getUsuario());

       /**
        * Derivamos o "está logado?" do próprio usuario, em vez de guardar dois
        * estados que poderiam ficar dessincronizados (ex.: logado=true e usuario=null).
        */
       const logado = usuario !== null;

       /** Chamado pelo Login quando a autenticação dá certo. */
       const aoLogar = (): void => {
         setUsuario(getUsuario());
       };

       /** Chamado pelo botão "Sair": apaga o token e volta ao login. */
       const aoSair = (): void => {
         clearToken();
         setUsuario(null);
       };

       if (!logado) {
         return <Login aoLogar={aoLogar} />;
       }

       return (
         <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
           <header className="text-center">
             <h1 className="text-3xl font-extrabold tracking-tight text-white">
               Bem-vindo, {usuario.email}!
             </h1>
             <p className="mt-2 text-sm text-slate-400">
               Autenticação funcionando. A lista de tarefas chega na Aula 07.
             </p>
           </header>

           <button
             onClick={aoSair}
             className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
           >
             Sair
           </button>
         </div>
       );
     }
     ```
4. **Explicação didática:** O `App.tsx` é o "cérebro": decide entre a tela de login e a tela logada. Dois conceitos-chave do documento: (1) o `useState` recebe **uma função** (`() => getUsuario()`) como valor inicial — o React entende que é uma "fábrica" e a chama uma única vez no primeiro render; se chamasse `getUsuario()` direto, o token seria lido e decodificado **a cada tecla digitada**, pois cada re-render recria o estado; (2) `logado` é um **estado derivado** (`usuario !== null`), e não um segundo estado independente — dois estados paralelos podem dessincronizar (`logado = true` com `usuario = null` quebraria a tela); derivar um do outro impossibilita o erro. O `Sair` fecha o ciclo: `clearToken()` apaga o JWT do `localStorage` e `setUsuario(null)` devolve o usuário à tela de login — sem recarregar nada.

---

## 9. Limpeza dos arquivos da Aula 05

1. **Arquivo:** `web/src/App.css` e `web/src/assets/` (apagar).
2. **Local no arquivo:** Pasta `web/src/`.
3. **Antes / Depois:**
   - Antes (estado atual confirmado): `web/src/` contém `assets`, `App.css`, `App.tsx`, `index.css`, `main.tsx`.
   - Depois: apagar `web/src/App.css` e a pasta `web/src/assets/`.
   - ⚠️ **Não apague** `web/public/favicon.svg` (nem `icons.svg`) — o `index.html` ainda usa o favicon.
   - Justificativa (confirme se quiser): `main.tsx` importa apenas `./index.css` e `./App.tsx` — nem `App.css` nem `assets/` são importados por nenhum arquivo do projeto.
4. **Explicação didática:** O Vite cria arquivos de demonstração (o CSS da página de exemplo e os logos SVG) que, após a Aula 05 substituir o `App.tsx`, ficaram órfãos — não são usados, mas continuam no projeto confundindo quem o lê. A exclusão é segura porque o `main.tsx`, único ponto de entrada do bundle, importa só `index.css` e `App`; algo que não é importado não entra no build e não pode quebrar nada. "Apagar código morto" é uma prática de manutenção: o projeto conta exatamente a história do que está vivo.

---

## 10. Corrigir os 3 erros reais do backend — `server.ts`

> O documento (seção "Três erros reais que este material corrige") afirma que o material corrige defeitos que existiam no projeto — e **os três existem no nosso `server.ts` atual**. Os dois primeiros só aparecem em tempo de execução: o TypeScript não reclama de nenhum deles.

### 10.1 Seed do admin com senha em texto puro (bug 1)

1. **Arquivo:** `server.ts`.
2. **Local no arquivo:** Fragmente de inicialização do banco — linhas 94–100 (bloco `if (usuariosExistentes.count === 0)`).
3. **Antes / Depois:**
   - **Antes** (linhas 96–100):
     ```ts
     const usuariosExistentes = stmtContarUsuarios.get() as { count: number };
     if (usuariosExistentes.count === 0) {
         stmtInserirUsuario.run("admin@senai.com", "senha_super_secreta_123");
     }
     ```
   - **Depois**:
     ```ts
     const usuariosExistentes = stmtContarUsuarios.get() as { count: number };
     if (usuariosExistentes.count === 0) {
         const hashAdmin = bcrypt.hashSync("senha_super_secreta_123", 10);
         stmtInserirUsuario.run("admin@senai.com", hashAdmin);
     }
     ```
   - ⚠️ Após a correção, **apague o `tarefas.db` e reinicie o backend** — o banco atual já tem a senha em texto puro gravada, e hashes nunca são recalculados retroativamente.
4. **Explicação didática:** O `POST /api/auth/login` compara a senha digitada com `bcrypt.compareSync(digitada, hashSalvo)` — e um hash **nunca** é igual ao texto puro que o gerou. Com a senha gravada "crua", a conta `admin@senai.com` nunca conseguiria entrar (os testes do `request.http` que a usam falhariam com 401), exatamente o sintoma listado na tabela de problemas da sessão de troubleshooting. Todo o material da aula parte do princípio de que essa conta existe e funciona — corrigir o seed para passar pelo `bcrypt.hashSync(...)` (o mesmo que o `/register` usa) fecha essa incoerência.

### 10.2 PATCH enviando um valor a menos (bug 2)

1. **Arquivo:** `server.ts`.
2. **Local no arquivo:** Rota `PATCH /api/tasks/:id` — final da transaction `fluxoAtualizacao`, linha ~289 (antes do `db.prepare(sql).run(...)`).
3. **Antes / Depois:**
   - **Antes** (linha 287–289):
     ```ts
     const sql = `UPDATE tarefas SET ${camposParaAtualizar.join(", ")} WHERE id = ? AND usuario_id = ?`;
     valoresParaAtualizar.push(idParaAtualizar);
     ```
   - **Depois**:
     ```ts
     const sql = `UPDATE tarefas SET ${camposParaAtualizar.join(", ")} WHERE id = ? AND usuario_id = ?`;
     valoresParaAtualizar.push(idParaAtualizar, usuarioId);
     ```
4. **Explicação didática:** A query tem **dois** placeholders `?` no `WHERE` (`id` e `usuario_id`), mas o código empilhava o array com apenas **um** valor — o `id`. O better-sqlite3 então lança `RangeError: Too few parameter values were provided` e a rota responde **500** em toda atualização parcial, o que o TypeScript não detecta em tempo de compilação (o erro só existe na hora de rodar). Pior: aquele `AND usuario_id = ?` é justamente a barreira de segurança que impede um usuário de editar a tarefa de outro usuário (testes 5.4/5.5 do `request.http` dependem dele) — um `?` esquecido aqui não é só um bug: é uma falha de isolamento.
### 10.3 `req.body` pode ser `undefined` (bug 3)

1. **Arquivo:** `server.ts`.
2. **Local no arquivo:** Rotas `POST /api/auth/register` (linha ~313) e `POST /api/auth/login` (linha ~341) — a primeira linha de cada uma.
3. **Antes / Depois:**
   - **Antes** (iguais nas duas rotas):
     ```ts
     const { email, senha } = req.body;
     ```
   - **Depois** (iguais nas duas rotas):
     ```ts
     const { email, senha } = req.body ?? {};
     ```
4. **Explicação didática:** Sem o header `Content-Type: application/json`, o Express não analisa o corpo da requisição e deixa `req.body` indefinido. A validação estava certa (`typeof email !== "string"` → 400), mas nunca era alcançada: a desestruturação `const { email } = undefined` estourava **antes**, derrubando a rota com 500 + stack trace — exatamente o que o teste 2.10 do `request.http` (login sem corpo nenhum → **espera 400**) cobre. O `?? {}` (operador de coalescência nula) fornece um objeto vazio como plano B, e então a validação normal de 400 acontece como previsto. Lição de engenharia: uma checagem de segurança só vale se o pior cenário conseguir **chegar** até ela.

---

## 11. Rodar e validar (terminal + navegador)

1. **Arquivo:** Não é edição — é verificação.
2. **Local no arquivo:** Terminal 2 (`web/`) para `lint`/`build`/`dev`; navegador em `http://localhost:5173`; extensão REST Client do VS Code com o `request.http` da raiz (Terminal 1 mantém o backend rodando).
3. **Antes / Depois (comandos e checklist):**
   ```bash
   # Terminal 2 (web/) — conferir tipos antes do navegador
   npm run lint
   npm run build
   # Se os dois passarem sem erro, o código está correto.

   npm run dev
   # Abra http://localhost:5173 → cartão escuro de login.
   ```
   - **Erro comum do lint nessa etapa** (prevenção): `'x' is declared but its value is never read` — ocorre se `validar()` existir mas `enviar()` não a chamar; a correção é consultar `validar()` no início de `enviar()` (já previsto no código-modelo da seção 7).
   - **Checklist de validação do documento (percorrer na ordem):**
     | # | O que fazer | Resultado esperado |
     |---|---|---|
     | 1 | Abrir `http://localhost:5173` | Cartão escuro "Gerenciador de Tarefas" |
     | 2 | Clicar em "Não tem conta? Registre-se" | Título vira "Crie sua conta para começar" |
     | 3 | Voltar para "Já tem conta? Entrar" | Modo login, sem recarregar a página |
     | 4 | Clicar "Entrar" sem digitar nada | Navegador bloqueia e foca o campo (`required`) |
     | 5 | Registrar `novo@senai.com` / `senha123` | Entra e mostra "Bem-vindo, novo@senai.com!" |
     | 6 | Clicar em "Sair" | Volta à tela de login |
     | 7 | Recarregar a página (F5) | **Continua logado** (token no localStorage) |
     | 8 | Registrar o mesmo e-mail de novo | Erro: "E-mail já cadastrado." |
     | 9 | Entrar com senha errada | Erro: "Credenciais inválidas." |
     | 10 | Registrar com senha de 3 letras | Erro: "A senha deve ter pelo menos 6 caracteres." |
     | 11 | DevTools → Application → Local Storage | Chave `gestor:token` com o JWT |
     | 12 | DevTools → Network → `/api/auth/login` | Status 200 e resposta `{"token":"..."}` |
   - **Teste da API sem navegador (`request.http`):** instalar a extensão **REST Client** (`humao.rest-client`) no VS Code e clicar em "Send Request". Rodar **em ordem** — o item 2.5 (login) captura o token automaticamente e as rotas seguintes o reutilizam; pular o 2.5 faz 2.9 e 3.x responderem 401. Os quatro testes-centro da aula: **2.1 → 201**, **2.5 → 200**, **2.7 → 401** (sem token), **2.9 → 200** (com token). Nota: o 2.1 responde 201 só na primeira vez; nas demais, 409 (comportamento esperado). Para recomeçar do zero, apague o `tarefas.db` e reinicie o backend.
   - **Alternativa sem extensão:** `curl` (já vem no Windows 10+; o documento prefere `curl`/REST Client a `Invoke-RestMethod` de PowerShell para funcionar igual no Codespaces/Linux).
4. **Explicação didática:** Validar em três camadas é o hábito profissional: o `npm run lint` cesa os deslizes pelo ESLint, o `npm run build` executa o `tsc` (o compilador TypeScript) e gera o bundle de produção — se os dois passam, o código está *estaticamente* correto; o checklist no navegador valida o *comportamento* (o item 7, recarregar e continuar logado, é o mais importante: prova que a persistência via `localStorage` funciona); e o `request.http` valida a API do lado do servidor, incluindo os casos de segurança (401 sem token, 409 com e-mail repetido). Cada camada enxerga uma classe de defeito diferente — juntas, cobrem quase tudo.

---

## 12. Subir para o Git e registrar no diário (terminal)

1. **Arquivo:** Não é edição de código — é commit + criação do diário.
2. **Local no arquivo:** Terminal na raiz do projeto; arquivo novo `diario/06_tela_login.md`.
3. **Antes / Depois (comandos):**
   ```bash
   git add .
   git commit -m "Aula 06: tela de login e registro no React com Tailwind"
   git push
   ```
   E criar `diario/06_tela_login.md` respondendo as 4 perguntas do documento:
   1. O que um `try / catch / finally` resolve que um `try / catch` sozinho não resolve?
   2. Por que o botão de trocar de modo precisa de `type="button"`?
   3. O que aconteceria se você confiasse no `getUsuario()` para decidir se o usuário pode acessar `/api/tasks`? Por que isso seria uma falha grave?
   4. Qual foi o erro mais difícil de resolver no seu ambiente?
4. **Explicação didática:** O commit marca um momento verificável da evolução do projeto ("se quebrar, voltamos para cá"), e o diário transforma a prática em aprendizado efetivo — as duas primeiras perguntas revisam conceitos técnicos (o `finally` e a armadilha do botão), e a terceira atacar o ponto mais delicado da aula: o `getUsuario()` **decodifica** mas não **valida**; se as rotas protegidas dependessem dele, bastaria forjar/alterar o payload no navegador para se passar por outro usuário — a autorização de verdade mora no `server.ts`, que confere a assinatura do JWT.

---

## Apêndice — Referência rápida do Tailwind (material de consulta, sem ação)

O documento inclui uma tabela de referência para usar em todas as próximas aulas de front-end — vale guardar:

- **Filosofia:** em vez de regras num `.css` separado (`.sair { background: #2563eb; ... }`), o estilo mora junto do elemento: `<button className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Sair</button>`. Ganho = manutenção: para entender como um botão foi estilizado você lê o próprio botão.
- **Dicionário CSS → Tailwind:** `background:#2563eb` → `bg-blue-600` | `color:#fff` → `text-white` | `padding: 8px 14px` → `px-4 py-2` | `border-radius: 6px` → `rounded-md` | `font-weight: 600` → `font-semibold` | `margin: 0 auto` → `mx-auto` | `display:flex` → `flex` | `gap: 8px` → `gap-2` | `width:100%` → `w-full` | `max-width:360px` → `max-w-[360px]` | `text-align:center` → `text-center` | `opacity:0.5` → `opacity-50` | `position:fixed` → `fixed` | `overflow-y:auto` → `overflow-y-auto`.
- **Estados (prefixos):** `hover:` (mouse), `active:` (clique), `focus:` (teclado), `disabled:`, `placeholder:`, e responsividade `sm:`/`md:`/`lg:`.
- **Escala:** espaçamento em múltiplos de 4px (`p-2` = 8px, `p-4` = 16px, `p-8` = 32px); cores em escala 50–900 (500 é a padrão, ex.: `slate-500`, `blue-500`).
- **Desafio de curiosidade:** trocar `bg-blue-600` por `bg-green-600` no botão e ver a cor mudar na hora (sem recarregar) — depois `npm run build` e confirmar o CSS gerado em `dist/assets/`.

---

## Problemas comuns (tabela de troubleshooting do documento)

| Sintoma | Causa provável | Solução |
|---|---|---|
| Página toda branca, sem estilo | Tailwind não configurado | Refazer seções 3 e 4 (aqui) e reiniciar o Vite |
| `Cannot find module '@tailwindcss/vite'` | Pacote não instalado | `npm install -D tailwindcss @tailwindcss/vite` em `web/` |
| `Token ausente ou mal formatado` (401) | Faltou header Authorization | Conferir `authHeaders()` e o `Bearer ` com espaço |
| `Credenciais inválidas` | E-mail/senha errados ou espaço sobrando | O código usa `email.trim()`; digite sem espaços extras |
| `Failed to fetch` no console | Back-end (:3000) parado | Voltar ao Terminal 1 e conferir `npm run dev` |
| Aviso de CORS no console | `cors` faltando no back | Neste projeto **já resolvido** (`app.use(cors())` confirmado no `server.ts`) |
| Erro de sintaxe perto de `<T>` | Escreveu `<T>` em vez de `<T,>` num `.ts` | Em `.ts`, a vírgula depois do T é obrigatória |
| `'x' is declared but its value is never read` | Função criada e nunca chamada | Chamar a função ou apagar |
| A tela não atualiza após o login | Estado não atualizado | Confirmar `aoLogar()` chamando `setUsuario(getUsuario())` |
| Recarrega ao clicar no link inferior | Faltou `type="button"` | Todo botão fora do envio precisa de `type="button"` |
| `request.http` sem botão Send Request | Extensão REST Client não instalada | `Ctrl+Shift+P` → REST Client → Install |
| Itens 2.9/3.x do request.http → 401 | Item 2.5 (login) não rodado antes | Rodar o arquivo em ordem (token capturado no 2.5) |
| Item 2.1 → 409 em vez de 201 | Conta `aluno@senai.com` já existe | Apagar `tarefas.db` + reiniciar, ou usar outro e-mail |
| `admin@senai.com` não entra (401) | Banco criado antes da correção 10.1 | Apagar `tarefas.db`: a senha do admin só funciona após o seed com bcrypt |

---

## Resumo da ordem de execução

| # | Ação | Onde |
|---|------|------|
| 1 | Conferência + `npm install` (2 terminais) + backend rodando | Terminal raiz + `web/` |
| 2 | `npm install -D tailwindcss @tailwindcss/vite` | Terminal `web/` → `web/package.json` |
| 3 | Ligar plugin do Tailwind | `web/vite.config.ts` (substituir) |
| 4 | `@import "tailwindcss"` + tema escuro no body | `web/src/index.css` (substituir) |
| 5 | `lang="pt-BR"`, título, `class="dark"` | `web/index.html` (substituir) |
| 6 | Criar ponte com a API (token, erros, login, registro, CRUD) | `web/src/api.ts` (novo) |
| 7 | Criar tela de login/registro | `web/src/Login.tsx` (novo) |
| 8 | Trocar cérebro: `Login` ↔ tela logada, `Sair` | `web/src/App.tsx` (substituir) |
| 9 | Apagar `App.css` e `assets/` (manter `public/`) | `web/src/` |
| 10 | Corrigir os 3 bugs do backend: seed bcrypt, patch com `usuarioId`, `req.body ?? {}` | `server.ts` (linhas 97–100, ~289, ~313 e ~341) + apagar `tarefas.db` |
| 11 | `npm run lint`, `npm run build`, `npm run dev` + checklist + `request.http` | Terminal + navegador + VS Code |
| 12 | Commit, push e diário | Terminal + `diario/06_tela_login.md` |
