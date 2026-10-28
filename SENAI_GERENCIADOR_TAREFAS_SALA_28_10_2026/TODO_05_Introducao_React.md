# Plano de Ações — Aula 05: Introdução ao React

> Origem: `05_Introducao_React.docx`
> Estado atual do projeto: backend pronto (`server.ts` na porta 3000, com `/api/health`, auth JWT e CRUD de tarefas em SQLite). **A pasta `web/` do front-end ainda NÃO existe.** O pacote `cors` também ainda NÃO está instalado (conferido no `package.json`).

---

## 1. Criar o projeto React com Vite (terminal)

1. **Arquivo:** Não é um arquivo — é a criação de um novo projeto via terminal, na **raiz** do diretório `C:\Dev\2_SENAI_GERENCIADOR_TAREFAS_AULA`.
2. **Local no arquivo:** Terminal na raiz do projeto (mesma pasta onde estão `server.ts` e `package.json`).
3. **Antes / Depois (comandos):**
   - Antes (estado atual): raiz do projeto contém apenas o backend.
   - Depois (executar, em ordem):
     ```bash
     npm create vite@latest web -- --template react-ts
     ```
   - Primeira pergunta do npm (antes do Vite começar):
     ```
     Need to install the following packages:
     create-vite@9.3.1
     Ok to proceed? (y)
     ```
     Responder `y` (ou apenas Enter). O npm baixa o pacote oficial `create-vite` — a ferramenta que fabrica o projeto — e pede confirmação na primeira vez, por ser um pacote ainda não presente no cache local.
   - Em seguida, as perguntas do próprio Vite:
     - Pergunta 1 → "Which linter to use?" → escolher ESLint (setas + Enter)
     - Pergunta 2 → "Install with npm and start now?" → escolher No
   - Após a criação do projeto, executar:
     ```bash
     cd web
     npm install
     npm run dev
     ```
   - Depois abrir no navegador: `http://localhost:5173`
   - Comando extra de verificação (dentro de `web/`):
     ```bash
     npm run lint
     ```
4. **Explicação didática:** O Vite é a ferramenta que monta a "fundação" do nosso front-end em segundos: ao rodar o comando, ele cria uma pasta `web` com um projeto React + TypeScript já configurado (template `react-ts`), poupando-nos de configurar manualmente transpilador, servidor de desenvolvimento e estrutura de pastas. Escolhemos o ESLint como linter — um "revisor automático" que aponta erros e más práticas enquanto escrevemos código — e respondemos "No" à instalação automática justamente para fazermos cada etapa manualmente, entendendo o que o `npm install` (que baixa as dependências listadas no `package.json`) e o `npm run dev` (que sobe o servidor de desenvolvimento com *hot reload*, na porta 5173) realmente fazem.

### 1.1 O que é o `npm run lint`? (o revisor automático)

1. **Arquivo:** Não é um arquivo — é um comando que executa o **ESLint** sobre todo o código do projeto. O comando está definido em `web/package.json` (na chave `"scripts"`) e volta a existir graças à configuração criada em `web/eslint.config.js` quando escolhemos ESLint durante a criação do projeto.
2. **Local no arquivo:** Terminal dentro da pasta `web/`. O trecho relevante do `web/package.json` gerado pelo Vite é:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "tsc -b && vite build",
     "lint": "eslint .",
     "preview": "vite preview"
   }
   ```
3. **Antes / Depois (teste indicado pelo desafio de curiosidade do documento):**
   - **Antes** (arquivo limpo — lint silencioso):
     ```bash
     PS C:\Dev\...\web> npm run lint
     ```
     ```
     ... (nenhuma saída de erro — o ESLint não encontra problemas)
     ```
   - **Depois** (adicionar em `web/src/App.tsx` uma variável criada e nunca usada):
     ```tsx
     const coisa = 123; // variável que nunca é usada
     ```
     Rodar `npm run lint` novamente e o ESLint acusa:
     ```
     C:\Dev\...\web\src\App.tsx
       1:7  error  'coisa' is defined but never used  @typescript-eslint/no-unused-vars
     ✖ 1 problem (1 error, 0 warnings)
     ```
     Ou seja: ele aponta **arquivo, linha e coluna** (1:7), o tipo do problema (`error`), uma mensagem legível (`'coisa' is defined but never used`) e a **regra** que foi violada (`@typescript-eslint/no-unused-vars`). Apagar a variável e rodar de novo faz o erro desaparecer.
4. **Explicação didática:** O ESLint é um *linter* — um revisor de código automático que lê cada arquivo do projeto e aponta problemas que o olho humano demora para notar: variáveis criadas e nunca usadas, erros de digitação em nomes, imports esquecidos, más práticas e inconsistências de estilo. O comando `npm run lint` funciona assim: o npm olha a chave `"lint"` dentro de `"scripts"` do `package.json` e executa o que estiver ali (nesse caso, `eslint .`, que varre o projeto inteiro). É como ter um professor de plantão todos os dias — por isso, a prática recomendada é rodar o lint sempre antes de commitar. O melhor é que as regras já vêm sensatamente configuradas pelo Vite em `eslint.config.js`, e ao longo do curso esse cuidador discreto continuará apontando nossos deslizes antes que eles virem bugs.

---

## 2. Limpar a página inicial — primeiro componente

1. **Arquivo:** `web/src/App.tsx` (será criado pelo Vite na etapa 1).
2. **Local no arquivo:** Todo o conteúdo do arquivo (substituição completa).
3. **Antes / Depois:**
   - **Antes** (conteúdo padrão do template Vite — página de demonstração com logos e contador):
     ```tsx
     import { useState } from 'react'
     import reactLogo from './assets/react.svg'
     import viteLogo from '/vite.svg'
     import './App.css'

     function App() {
       const [count, setCount] = useState(0)

       return (
         <>
           <div>
             <a href="https://vite.dev" target="_blank">
               <img src={viteLogo} className="logo" alt="Vite logo" />
             </a>
             <a href="https://react.dev" target="_blank">
               <img src={reactLogo} className="logo react" alt="React logo" />
             </a>
           </div>
           <h1>Vite + React</h1>
           <div className="card">
             <button onClick={() => setCount((count) => count + 1)}>
               count is {count}
             </button>
             <p>
               Edit <code>src/App.tsx</code> and save to test HMR
             </p>
           </div>
           <p className="read-the-docs">
             Click on the Vite and React logos to learn more
           </p>
         </>
       )
     }

     export default App
     ```
   - **Depois** (apagar tudo e digitar):
     ```tsx
     function Saudacao() {
       return <h1>Olá, turma! Minha primeira interface!</h1>;
     }

     export default function App() {
       return (
         <div>
           <Saudacao />
         </div>
       );
     }
     ```
4. **Explicação didática:** Um componente React é apenas uma função que devolve JSX (uma sintaxe que "parece HTML" dentro do JavaScript) — aqui criamos `Saudacao`, nosso primeiro componente, e o usamos dentro de `App` como se fosse uma tag `<Saudacao />`. Isso demonstra a essência do React: em vez de escrever páginas inteiras, combinamos pequenas funções reutilizáveis como blocos de LEGO, e o navegador atualiza a tela sozinho ao salvar o arquivo (o famoso *hot reload* do Vite).

---

## 3. Estado com `useState` — o contador

1. **Arquivo:** `web/src/App.tsx`.
2. **Local no arquivo:** Topo do arquivo (novo import) e dentro da função `App` (novo estado + novo bloco no JSX).
3. **Antes / Depois:**
   - **Antes** (código da etapa 2):
     ```tsx
     function Saudacao() {
       return <h1>Olá, turma! Minha primeira interface!</h1>;
     }

     export default function App() {
       return (
         <div>
           <Saudacao />
         </div>
       );
     }
     ```
   - **Depois**:
     ```tsx
     import { useState } from "react";

     function Saudacao() {
       return <h1>Olá, turma! Minha primeira interface!</h1>;
     }

     export default function App() {
       const [n, setN] = useState(0);

       return (
         <div>
           <Saudacao />
           <hr />
           <h2>Contador interativo</h2>
           <button onClick={() => setN(n + 1)}>
             Cliquei {n} vezes
           </button>
         </div>
       );
     }
     ```
4. **Explicação didática:** O `useState` é o "gancho" do React que dá memória a um componente: chamamos `useState(0)` e ele devolve um par `[n, setN]` — o valor atual e a função que o altera. Quando clicamos no botão, chamamos `setN(n + 1)` e o React automaticamente re-renderiza a tela com o novo valor; nunca devemos alterar `n` diretamente, pois só a função `setN` avisa o React que é hora de atualizar a interface. (Desafio do documento: trocar `useState(0)` por `useState(10)` e observar por que a tela "lembra" do valor.)

---

## 4. Front-end falando com o Back-end — `useEffect` + `fetch`

1. **Arquivo:** `web/src/App.tsx`.
2. **Local no arquivo:** Import (adicionar `useEffect`) e dentro de `App` (novo estado `mensagem` + efeito de carregamento + novo bloco no JSX). Pré-requisito: rodar o `server.ts` do backend em outro terminal (porta 3000).
3. **Antes / Depois:**
   - **Antes** (código da etapa 3):
     ```tsx
     import { useState } from "react";
     ```
   - **Depois** (import):
     ```tsx
     import { useState, useEffect } from "react";
     ```
   - **Antes** (dentro de `App`):
     ```tsx
     const [n, setN] = useState(0);
     ```
   - **Depois** (dentro de `App`):
     ```tsx
     const [n, setN] = useState(0);
     const [mensagem, setMensagem] = useState("Carregando...");

     useEffect(() => {
       // Ajuste a URL para a rota pública de teste do seu backend
       fetch("http://localhost:3000/api/health")
         .then(res => res.json())
         .then(data => {
            console.log("Dados recebidos do back-end:", data);
            setMensagem("Conexão estabelecida com sucesso!");
         })
         .catch(err => setMensagem("Erro ao conectar com o servidor"));
     }, []);
     ```
   - **Antes** (no JSX, após o botão):
     ```tsx
     <button onClick={() => setN(n + 1)}>
       Cliquei {n} vezes
     </button>
     </div>
     ```
   - **Depois** (no JSX, após o botão):
     ```tsx
     <button onClick={() => setN(n + 1)}>
       Cliquei {n} vezes
     </button>
     <hr />
     <h2>Status do Servidor</h2>
     <p>{mensagem}</p>
     </div>
     ```
4. **Explicação didática:** O `useEffect` executa um código no "ciclo de vida" do componente — com o array vazio `[]` como segundo parâmetro, ele roda **apenas uma vez**, logo após a primeira renderização, que é o momento perfeito para buscar dados. Usamos o `fetch` para pedir a rota pública `/api/health` do nosso backend (que já responde na porta 3000), encadeando `.then()` para converter a resposta em JSON e atualizar a mensagem na tela, e `.catch()` para capturar qualquer falha de conexão. É aqui que, muito provavelmente, o famoso erro de **CORS** vai aparecer no console — o que nos leva ao próximo passo.

---

## 5. Liberar o CORS no backend

### 5.1 Instalar o pacote (terminal)

1. **Arquivo:** Não é edição manual — os comandos atualizam `package.json` e `package-lock.json` automaticamente.
2. **Local no arquivo:** Terminal na pasta do **backend** (raiz, onde está `server.ts`).
3. **Antes / Depois (comandos):**
   - Antes (`package.json` → `dependencies`): sem o `cors`.
   - Depois (executar):
     ```bash
     npm install cors
     npm install -D @types/cors
     ```
   - Depois (`package.json` → resultado esperado):
     ```json
     "dependencies": {
       "bcryptjs": "^3.0.3",
       "better-sqlite3": "^13.0.3",
       "cors": "^2.8.5",
       "express": "^5.2.1",
       "jsonwebtoken": "^9.0.3"
     }
     ```
4. **Explicação didática:** O `cors` é o pacote que ensina nosso servidor Express a responder requisições vindas de outras origens (como o React na porta 5173), e o `@types/cors` — instalado com `-D` (dependência de desenvolvimento) — é apenas o "dicionário de tipos" que permite o TypeScript entender esse pacote. Instalar via `npm` garante que a dependência fique registrada no `package.json`, assim qualquer pessoa que clonar o projeto e rodar `npm install` terá tudo pronto.

### 5.2 Editar o `server.ts` — import

1. **Arquivo:** `server.ts` (raiz do projeto).
2. **Local no arquivo:** Linha 4 do arquivo, junto aos demais imports (topo).
3. **Antes / Depois:**
   - **Antes** (linhas 1–4):
     ```ts
     import bcrypt from "bcryptjs";
     import jwt from "jsonwebtoken";
     import express, { Request, Response, NextFunction } from "express";
     import Database from "better-sqlite3";
     ```
   - **Depois** (linhas 1–5):
     ```ts
     import bcrypt from "bcryptjs";
     import jwt from "jsonwebtoken";
     import cors from 'cors';
     import express, { Request, Response, NextFunction } from "express";
     import Database from "better-sqlite3";
     ```
4. **Explicação didática:** Todo pacote instalado precisa ser "importado" antes de ser usado — essa linha traz o `cors` para dentro do nosso arquivo, exatamente como já fazemos com `express` e `bcryptjs`. Em TypeScript, essa linha só compila por causa do `@types/cors` instalado antes, que informa ao compilador que a função `cors()` existe e como usá-la.

### 5.3 Editar o `server.ts` — ativar o middleware

1. **Arquivo:** `server.ts` (raiz do projeto).
2. **Local no arquivo:** Logo após a criação do `app` (linha 6), **antes** do `app.use(express.json())` (linha 60).
3. **Antes / Depois:**
   - **Antes** (linha 6):
     ```ts
     const app = express();
     ```
   - **Depois** (linha 6):
     ```ts
     const app = express();
     app.use(cors()); // Libera o CORS para todas as rotas
     ```
4. **Explicação didática:** O `app.use(cors())` registra um middleware (um "intermediário" que processa toda requisição) que adiciona às respostas do servidor os cabeçalhos HTTP de autorização — é o servidor literalmente dizendo ao navegador: "pode confiar, requisições da origem do React são permitidas". Isso resolve o bloqueio da *Same-Origin Policy*, porque o navegador considera `localhost:5173` (React) e `localhost:3000` (API) origens diferentes (protocolo + domínio + porta). Após salvar, é preciso **reiniciar o backend** (`Ctrl+C` + `npm run dev`) — o `tsx watch` pode até reiniciar sozinho, mas o documento pede a conferência manual — e recarregar a página do React; a tela deve exibir "Conexão estabelecida com sucesso!". (Desafio do documento: remover essa linha, reiniciar e observar o erro de CORS voltar.)

---

## 6. Versão final da aula — renderizando a lista de tarefas

1. **Arquivo:** `web/src/App.tsx`.
2. **Local no arquivo:** Estado novo dentro de `App` (após `mensagem`) + novo bloco final no JSX.
3. **Antes / Depois:**
   - **Antes** (dentro de `App`, código da etapa 4):
     ```tsx
     const [n, setN] = useState(0);
     const [mensagem, setMensagem] = useState("Carregando...");
     ```
   - **Depois** (dentro de `App`, código da etapa 4):
     ```tsx
     const [n, setN] = useState(0);
     const [mensagem, setMensagem] = useState("Carregando...");

     // Simulando tarefas que virão do Back-end
     const [tarefas] = useState([
       { id: 1, titulo: "Configurar Vite e React" },
       { id: 2, titulo: "Entender useState e useEffect" },
       { id: 3, titulo: "Renderizar lista com map()" }
     ]);
     ```
   - **Antes** (no JSX, após o bloco "Status do Servidor"):
     ```tsx
     <h2>Status do Servidor</h2>
     <p>{mensagem}</p>
     </div>
     ```
   - **Depois** (no JSX, após o bloco "Status do Servidor"):
     ```tsx
     <h2>Status do Servidor</h2>
     <p>{mensagem}</p>
     <hr />
     <h2>Minhas Tarefas</h2>
     <ul>
       {tarefas.map(tarefa => (
         <li key={tarefa.id}>{tarefa.titulo}</li>
       ))}
     </ul>
     </div>
     ```
4. **Explicação didática:** Aqui simulamos (com um array fixo dentro do `useState`) as tarefas que no futuro virão do banco de dados, e usamos o `.map()` do JavaScript — que transforma cada item do array em um `<li>` — para renderizar a lista de forma dinâmica: se o array mudar, o React redesenha a lista sozinho. A propriedade `key={tarefa.id}` é obrigatória em listas no React, pois dá a cada elemento uma "identidade" que permite ao framework rastrear quais itens mudaram, viraram ou saíram, tornando a atualização eficiente.

---

## 7. Prévia do próximo passo — arquivo `web/src/api.ts`

1. **Arquivo:** `web/src/api.ts` (**ainda não criar** — o documento só anuncia o formato para a próxima aula).
2. **Local no arquivo:** Novo arquivo dentro de `web/src/`.
3. **Antes / Depois:** Não há "antes"; o formato futuro definido no documento é:
   ```ts
   export const listarTarefas = async (search = ""): Promise<Tarefa[]> => {
     const url = `${API_BASE}/api/tasks${search ? `?search=${encodeURIComponent(search)}` : ""}`;
     const res = await fetch(url, { headers: authHeaders() });
     return tratarResposta(res);
   };
   ```
4. **Explicação didática:** Nesta etapa **nada deve ser feito agora** — é um aviso do roteiro. Na próxima aula, substituiremos o array estático de tarefas por funções profissionais em um arquivo dedicado (`api.ts`), que centralizará todas as chamadas HTTP: montando a URL com filtros de busca seguros (via `encodeURIComponent`), enviando o token de autenticação nos headers (via `authHeaders()`, pois a rota `/api/tasks` exige JWT no nosso backend) e padronizando o tratamento de erros (via `tratarResposta`).

---

## 8. Versionar no Git e registrar no diário (terminal)

1. **Arquivo:** Não é edição de código — é commit + criação de um arquivo de diário.
2. **Local no arquivo:** Terminal na raiz do projeto; arquivo novo em `diario/05_intro_react.md`.
3. **Antes / Depois (comandos):**
   ```bash
   git add .
   git commit -m "Aula 05: Criacao do front com Vite, componentes, fetch e renderizacao de lista"
   git push
   ```
   E criar/atualizar o arquivo `diario/05_intro_react.md` registrando as práticas realizadas e os desafios de curiosidade explorados (efeito do `npm run lint` com variável não usada, teste do `useState(10)`, teste de remoção do `app.use(cors())`).
4. **Explicação didática:** Fechamos a aula registrando o trabalho no Git — `git add .` prepara todos os arquivos modificados/criados, o `git commit` cria o marco na história do projeto com uma mensagem descritiva, e o `git push` publica na nuvem — além de manter um diário em Markdown, onde documentar o que você fez e descobriu (inclusive os desafios de curiosidade) consolida o aprendizado e serve como material de revisão para as próximas aulas.

---

## Resumo da ordem de execução

| # | Ação | Onde |
|---|------|------|
| 1 | Criar projeto Vite (`web`) + escolher ESLint + `npm install` + `npm run dev` | Terminal (raiz) |
| 2 | Substituir todo o `App.tsx` pelo componente `Saudacao` | `web/src/App.tsx` |
| 3 | Adicionar contador com `useState` | `web/src/App.tsx` |
| 4 | Adicionar `useEffect` + `fetch` para `/api/health` | `web/src/App.tsx` |
| 5 | Instalar `cors` + `@types/cors` | Terminal (raiz do backend) |
| 6 | Adicionar `import cors` e `app.use(cors())` | `server.ts` (linhas 1–4 e 6) |
| 7 | Adicionar lista de tarefas com `.map()` | `web/src/App.tsx` |
| 8 | Commit, push e diário | Terminal + `diario/05_intro_react.md` (próxima etapa: `web/src/api.ts`) |
