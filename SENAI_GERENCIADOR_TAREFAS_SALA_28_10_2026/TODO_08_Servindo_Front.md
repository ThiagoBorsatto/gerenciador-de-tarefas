# Plano de Ações — Aula 08: Servindo o Front pelo Back

> Origem: `08_servindo_front.docx`
> Pré-requisito: Aula 07 (CRUD de Tarefas) — **concluída e confirmada** (`Tarefas.tsx` completo, `App.tsx` renderizando `<Tarefas>`, backend compilando com `tsconfig.json` criado e `tsc` sem erros).
> Estado atual confirmado: `server.ts` **sem** os blocos desta aula (sem `fs`/`path`/`fileURLToPath`, `app.listen` com 3 linhas); `web/src/api.ts` com `API_BASE` fixo (linha 21); `package.json` **sem** `build:web`/`dev:web`; `request.http` é a variante antiga (itens 1–41, token fixo colado no arquivo) e **sem** a seção nova da Aula 08; **`.gitignore` na raiz não existe** (arquivo novo desta aula).

> ⚠️ **Regra deste MD (mantida):** todo bloco rotulado **"Depois"** contém o **código FINAL completo** — copie e cole **integralmente**. Nunca existe `...` como corpo de função.

> 💡 **Idea central da aula:** hoje o `server.ts` passa a entregar também o React. Duas origens (:5173 e :3000) viram **uma** (:3000), e a resposta à pergunta da aula é: **"preciso de CORS?" → não, mais** (em produção; em desenvolvimento sim, e o `cors()` continua no código pelo motivo certo).

---

## 1. Conferência inicial (nada a copiar — tudo já está no projeto)

1. **Arquivo:** Não é edição — é conferência de pré-requisitos.
2. **Local no arquivo:** Terminal na raiz do projeto.
3. **Antes / Depois (comandos):**
   - O documento manda copiar `web/` (sem `dist`) de `20261021_crud_tarefas` — **para quem começa de uma cópia**. Aqui os arquivos já estão; confira apenas:
     ```text
     web/src/  →  api.ts (Aula 06/07), App.tsx, Login.tsx, Tarefas.tsx (Aula 07), index.css, main.tsx
     app.listen no server.ts → atual é o de 3 linhas (será alterado, seção 4 deste MD)
     ```
   - Dependências (se precisar):
     ```bash
     npm install          # Terminal 1 — raiz
     cd web && npm install && cd ..   # Terminal 2 — front
     ```
4. **Explicação didática:** A Fase 04 abre com uma inversão de perspectiva: até hoje o Express era só a API; a partir de agora ele também é **servidor de arquivos estáticos** — o papel que o Vite exercia no desenvolvimento. Nesta rota nada da API muda (nenhuma rota é alterada); o que acrescentamos é o que o Express faz com os caminhos que **não** são da API. E a conferência em destaque: o `web/dist` (o build) **não vai para o Git** — guardar um arquivo gerado é justamente um dos problemas que esta aula resolve.

---

## 2. `server.ts` — Passo 1: descobrir a pasta do build (ESM)

1. **Arquivo:** `server.ts`.
2. **Local no arquivo:** Imports no topo + bloco novo logo depois de `const JWT_SECRET = ...` (linha 8).
3. **Antes / Depois:**
   - **Antes** (imports, linhas 1–5):
     ```ts
     import bcrypt from "bcryptjs";
     import jwt from "jsonwebtoken";
     import cors from 'cors';
     import express, { Request, Response, NextFunction } from "express";
     import Database from "better-sqlite3";
     ```
   - **Depois** (imports, linhas 1–8 — adicionar os três imports do Node):
     ```ts
     import bcrypt from "bcryptjs";
     import jwt from "jsonwebtoken";
     import cors from 'cors';
     import express, { Request, Response, NextFunction } from "express";
     import Database from "better-sqlite3";
     import fs from "node:fs";
     import path from "node:path";
     import { fileURLToPath } from "node:url";
     ```
   - **Antes** (contexto, linhas 6–8):
     ```ts
     const app = express();
     app.use(cors()); // Libera o CORS para todas as rotas
     const PORT = Number(process.env.PORT) || 3000;
     const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_desenvolvimento";
     ```
   - **Depois** (linhas 8–9 — logo após `const JWT_SECRET = ...`, CONTINUA com o resto igual):
     ```ts
     const JWT_SECRET = process.env.JWT_SECRET || "super_secreto_desenvolvimento";

     // O projeto usa "type": "module" no package.json, ou seja, roda como ESM.
     // Nesse modo não existe a variável __dirname que o Node antigo oferecia: o
     // caminho do arquivo atual precisa ser reconstruído a partir de
     // import.meta.url, e é o que o fileURLToPath faz por nós.
     const __dirname = path.dirname(fileURLToPath(import.meta.url));

     /** Pasta que o `npm run build` do Vite cria dentro de web/. */
     const FRONT_DIST = path.join(__dirname, "web", "dist");

     /** O arquivo de entrada que o SPA fallback entrega. */
     const FRONT_INDEX = path.join(FRONT_DIST, "index.html");

     /**
      * Resposta que aparece quando alguém abre a página e a pasta web/dist ainda
      * não existe. Um erro de "Cannot GET /" não ajuda ninguém a descobrir que
      * faltou um `npm run build`, então a mensagem diz exatamente o que fazer.
      */
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

     /**
      * Devolve a data de modificação mais recente de uma pasta, olhando dentro das
      * subpastas também. Serve para comparar os fontes do front com o build.
      */
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
     ```
   - O `FRONT_INDEX` e o `SEM_BUILD` entram agora porque são citados pelas três peças da seção 3 e pelo aviso de inicialização (seção 4). ⚠️ **Do documento:** `__dirname` **não existe em projeto ESM** (`"type": "module"` no `package.json`) — escrevê-lo quebra o processo em execução; o caminho se reconstrói a partir de `import.meta.url` (o `fileURLToPath` transforma `file:///C:/.../server.ts` em `C:\...\server.ts`, e só então o `path.dirname` acha a pasta).
4. **Explicação didática:** Para entregar arquivos o Express precisa do caminho **absoluto** da pasta do build — mas este projeto é ESM (módulos nativos), e nesse modo o `__dirname` do Node antigo simplesmente não existe: o TypeScript acusa e o processo estoura em execução com um erro pouco elucidativo. A receita é montar dois caminhos uma única vez e nomeá-los (`FRONT_DIST` e `FRONT_INDEX`): guardá-los em constantes permite citá-los em três lugares diferentes sem risco de digitar o caminho errado num deles — em vez de espalhar `path.join(...)` pela aula inteira. As constantes `SEM_BUILD` e a função `maisRecente()` já entram aqui, pois são as ferramentas dos dois avisos de inicialização (seção 4): mensagens que dizem **o que fazer** em vez do críptico "Cannot GET /".

---

## 3. `server.ts` — Passo 2: as três peças (a ordem é o conteúdo da aula)

1. **Arquivo:** `server.ts`.
2. **Local no arquivo:** Logo depois da **última rota** `/api` ( após `app.post("/api/auth/login", ...)`, que termina com `return res.json({ token });` e `}`), e **antes** de `app.listen(PORT, ...)`. **Nunca antes das rotas da API.**
3. **Antes / Depois:**
   - **Antes** (fim do arquivo antes de `app.listen`):
     ```ts
     app.listen(PORT, () => {
         console.log(`Servidor rodando em: http://localhost:${PORT}`);
     });
     ```
   - **Depois** (as três peças + o `app.listen` novo, com os avisos da seção 4 — colar o bloco inteiro):
     ```ts
     // (a) Uma rota de API que não existe tem que responder JSON, e não HTML.
     // Se esta linha ficasse depois do SPA fallback, "GET /api/typo" cairia nele e
     // devolveria o index.html com status 200: um erro da API viraria uma página de
     // "sucesso", e o front receberia HTML onde esperava JSON.
     app.use("/api", (_req: Request, res: Response) => {
         res.status(404).json({ error: "Rota de API não encontrada." });
     });

     // (b) Os arquivos que o `npm run build` do Vite produziu em web/dist.
     // index.html, os .js com hash no nome, o .css e as imagens da public/.
     app.use(express.static(FRONT_DIST));

     // (c) Qualquer outro caminho não é API: é uma rota do React, que roda no
     // navegador. Devolvemos o index.html para o app assumir. É o que permite
     // abrir ou recarregar /tarefas sem o servidor responder "não encontrado".
     //
     // Sobre o /(.*)/: no Express 5 o curinga "*" deixou de existir e precisa ser
     // escrito como regex (a outra forma seria o padrão nomeado "/*splat"). O ponto
     // é que este curinga é bem mais largo que o do Express 4 — por isso a linha
     // (a) acima precisa vir antes: é ela que impede "/api/qualquer-coisa" de cair
     // aqui e virar uma página em vez de um erro.
     app.get(/(.*)/, (_req: Request, res: Response) => {
         if (!fs.existsSync(FRONT_INDEX)) {
             return res.status(503).type("text/plain").send(SEM_BUILD);
         }

         return res.sendFile(FRONT_INDEX);
     });

     app.listen(PORT, () => {
         console.log(`Servidor rodando em: http://localhost:${PORT}`);
         console.log(`API:   http://localhost:${PORT}/api/health`);
         console.log(`Front: http://localhost:${PORT}`);
         verificarFront();
     });
     ```
   - ⚠️ Detalhe do Express 5: `app.get("*")` **não compila mais** (path-to-regexp v8 rejeita). Formas válidas: regex `/(.*)/` ou nomeado `"/ *splat"` — este projeto usa a regex. E `app.use("/api", ...)` casa por **segmento**: `/apixyz` **não** é capturado (aparece no teste 6.5 do `request.http`).
4. **Explicação didática:** A ordem a → b → c **não é estilo, é o mecanismo** — cada peça só age quando as anteriores não responderam. **(a)** captura tudo em `/api/*` que sobrou (ou seja, rota inexistente) e responde **404 JSON** — sem ela, `GET /api/typo` cairia no fallback e devolveria `index.html` com **200**: um erro de API viraria página de "sucesso", o `fetch` recebe HTML onde esperava JSON e a tela mostra "Falha ao buscar" sem pista nenhuma; pior, `POST /api/typo` devolvia 404 (o `app.get` só atende GET) — o mesmo defeito mudando de cara conforme o método. **(b)** `express.static` procura o arquivo pedido em `web/dist` e responde com o Content-Type correto (uma linha!), e **não responde nada** quando o arquivo não existe — passando a bola para **(c)**, o **SPA fallback**: quem manda na tela é o React no navegador; ao recarregar `/tarefas` o pedido chega ao Node, que não tem rota nenhuma para isso — devolvendo o `index.html`, o browser baixa o bundle, o React olha a URL e desenha a tela certa (é o que faz o "voltar" do navegador funcionar em SPA). Detalhe: `express.static` precisa vir **depois** das rotas `/api` — se viesse antes, `api/tasks` "não existiria" na pasta e cairia no fallback, devolvendo HTML para toda a API.

---

## 4. `server.ts` — Passo 3: a função `verificarFront()` (os dois avisos)

1. **Arquivo:** `server.ts`.
2. **Local no arquivo:** A função completa fica **logo antes** do `app.listen(PORT, ...)` (após as três peças).
3. **Antes / Depois:**
   - **Antes:** a função não existe.
   - **Depois** (o documento mostra os dois avisos em seções separadas — **7.1 e 7.2**; a função completa é a junção dos dois **corpos**. Copie completo):
     ```ts
     function verificarFront(): void {
         if (!fs.existsSync(FRONT_INDEX)) {
             console.warn("\n[ATENÇÃO] " + SEM_BUILD + "\n");
             return;
         }

         const fontes = path.join(__dirname, "web", "src");
         const temFontes = fs.existsSync(fontes);

         if (temFontes && maisRecente(fontes) > fs.statSync(FRONT_INDEX).mtimeMs) {
             console.warn(
                 "\n[ATENÇÃO] O build do front está VELHO: algum arquivo de web/src " +
                 "mudou depois do último `npm run build`.\n" +
                 "          Rode `cd web && npm run build` para ver a mudança.\n",
             );
         }
     }
     ```
4. **Explicação didática:** Existe uma família inteira de problemas que só aparece depois desta aula, e todos têm a mesma raiz: **`web/dist` é um arquivo gerado, e ninguém se lembra de gerá-lo**. O aviso 1 (build inexistente) converte um `Cannot GET /` críptico em um passo a passo na tela (com 503 e instrução). O aviso 2 (build **velho**) é o pior: ele **não dá erro nenhum** — a página abre, o login funciona, e a sua última alteração simplesmente não aparece; você salva, aperta F5, nada muda, e a conclusão natural ("quebrei o código") está errada, porque o navegador não tem o seu fonte: tem o que foi compilado antes. A defesa é comparar a data de modificação mais recente de `web/src` com a do build (`maisRecente(fontes) > statSync(FRONT_INDEX).mtimeMs`) — "comparar datas custa nada e adivinha errado nunca".

---

## 5. `web/src/api.ts` — Passo 4: o fim do `localhost:3000` fixo (1 linha)

1. **Arquivo:** `web/src/api.ts`.
2. **Local no arquivo:** Primeira constante (linha 21). **Todos os `${API_BASE}/api/...` continuam os mesmos — o resto do arquivo não muda nada.**
3. **Antes / Depois:**
   - **Antes** (linha 21):
     ```ts
     const API_BASE = "http://localhost:3000";
     ```
   - **Depois** (linha 21):
     ```ts
     // Endereço da API — e o detalhe mais importante desta aula.
     //
     // Em desenvolvimento, o Vite serve a tela em http://localhost:5173 enquanto a
     // API vive em http://localhost:3000. São duas origens diferentes, então o
     // endereço precisa ser completo.
     //
     // Depois do `npm run build`, é o próprio server.ts que entrega a tela (Aula
     // 08). A página e a API passam a vir da MESMA origem, e aí um caminho relativo
     // basta: o "" abaixo faz o fetch pedir "/api/tasks", e o navegador resolve a
     // partir do endereço que está na barra. É isso que permite rodar o MESMO
     // arquivo em qualquer máquina, em qualquer porta, sem recompilar nada.
     //
     // O Vite troca import.meta.env.DEV por true ou false na hora do build, então
     // o typeof nem existe no JavaScript final.
     const API_BASE = import.meta.env.DEV ? "http://localhost:3000" : "";
     ```
   - ⚠️ **Comprovação proposta pelo documento** (após o build, o resultado deve imprimir `total: 0`; se der 1, o build está velho). **Tudo na raiz do projeto** — e atenção: o atalho `build:web` só existe depois de aplicar a seção 6 (`package.json`); se ainda não aplicou, use o fallback:
     ```bash
     # Opção A — se a seção 6 (atalhos) já foi aplicada (na raiz):
     npm run build:web
     node -e "const fs=require('fs');let t=0;for(const f of fs.readdirSync('web/dist/assets')){if(f.endsWith('.js')){const s=fs.readFileSync('web/dist/assets/'+f,'utf8');const n=s.split('localhost:3000').length-1;console.log(f+': '+n);t+=n}}console.log('total: '+t)"

     # Opção B — fallback sem os atalhos (buildar caminho alternativo sem sair do dev):
     cd web
     npm run build          # o "build" próprio da web — mesmo resultado
     cd ..                  # o comando node abaixo lê "web/dist" relativo: rodar da RAIZ
     node -e "const fs=require('fs');let t=0;for(const f of fs.readdirSync('web/dist/assets')){if(f.endsWith('.js')){const s=fs.readFileSync('web/dist/assets/'+f,'utf8');const n=s.split('localhost:3000').length-1;console.log(f+': '+n);t+=n}}console.log('total: '+t)"
     ```
     > **Erro comum:** rodar `npm run build:web` de dentro de `web/` → `npm error Missing script`, pois o npm procura o script no `package.json` **da pasta atual** (`web/`); o atalho foi definido no da **raiz** (`npm --prefix web run build` é o que o faz funcionar de lá). Em `web/`, o comando certo é `npm run build`.
4. **Explicação didática:** O `localhost:3000` fixo funcionava na sua máquina e **só na sua máquina**: no dia em que o projeto subir para `https://gestor.senai.com.br`, o `api.js` servido ao navegador ainda pediria `localhost:3000` — cada visitante tentaria falar com o próprio computador, que não tem nada. No modo "servido pelo back", tela e API vêm da **mesma origem** (mesmo esquema, host e porta), então até `http://`, host e porta sobram: um caminho relativo (`""` → `fetch("/api/tasks")`) resolve, e o navegador completa pelo endereço da barra. O Vite já dá o sinal de quem somos no momento: `import.meta.env.DEV` é trocado por `true/false` **na hora do build** — no bundle final o `?:` some junto com o lado que não pode acontecer (o compilador descarta o `localhost:3000` morto). **E o `cors()`? Continua, com razão:** no desenvolvimento (:5173 vs :3000) a origem é diferente e o navegador exige a autorização; em produção (mesma origem) ele vira resquício inofensivo. Aula 05 o apresentou como receita permanente; esta aula mostra que a receita era temporária — indicada pelo modo de rodar, não pelo projeto.

---

## 6. `package.json` — Passo 5: os dois atalhos

1. **Arquivo:** `package.json` (raiz).
2. **Local no arquivo:** Chave `"scripts"` (linha 5).
3. **Antes / Depois:**
   - **Antes** (atual):
     ```json
     "scripts": {
       "dev": "tsx watch server.ts",
       "start": "tsx server.ts",
       "build": "tsc"
     }
     ```
   - **Depois**:
     ```json
     "scripts": {
       "dev": "tsx watch server.ts",
       "start": "tsx server.ts",
       "build": "tsc",
       "build:web": "npm --prefix web run build",
       "dev:web": "npm --prefix web run dev"
     }
     ```
4. **Como executar na prática (os dois modos, terminal por terminal):**
   - **Modo 1 — Desenvolvimento (2 terminais, a forma de escrever código):**

     | Terminal | Pasta | Comando | O que ocupa |
     |---|---|---|---|
     | 1 | raiz (`C:\Dev\2_SENAI_GERENCIADOR_TAREFAS_AULA`) | `npm run dev` | O **backend** em `http://localhost:3000` — fica rodando |
     | 2 | **com os atalhos**: raiz mesmo | `npm run dev:web` | O **front** (Vite) em `http://localhost:5173` — fica rodando |
     | 2 | sem os atalhos (modo antigo): dentro de `web/` | `cd web` → `npm run dev` | O mesmo Vite, precisando trocar de pasta antes |

     Nesse modo basta **salvar o arquivo** em `web/src/` e o navegador recarrega sozinho (hot reload do Vite). Abra `http://localhost:5173` — e é aqui que o `cors()` e o `API_BASE` fixo (`DEV = true`) entram em ação.
   - **Modo 2 — Servido pelo back (1 terminal, a forma de testar "de verdade"):**

     | Passo | Pasta | Comando | O que faz |
     |---|---|---|---|
     | 1 | raiz | `npm run build:web` | Gera o `web/dist/` (termina — não fica rodando) |
     | 2 | raiz | `npm run dev` | Backend + **tela** juntos em `http://localhost:3000` |

     Abra `http://localhost:3000` — o próprio Express entrega o React (`API_BASE` relativo, sem CORS em jogo). ⚠️ Se ele imprimir `[ATENÇÃO] O build do front está VELHO...`, rode o passo 1 de novo e recarregue.
   - **Regra de bolso:**
     ```text
     Você vai EDITAR código?           → Modo 1 (dev:web + dev) — 2 terminais, recarrega ao salvar
     Você vai EXIBIR/testar como fica? → Modo 2 (build:web + dev) — 1 terminal, precisa buildar a cada mudança
     ```
   - Lembretes do capítulo do "Missing script": os dois atalhos novos **pertencem à raiz**; se você estiver dentro de `web/` e quiser buildar, o comando de lá é `npm run build`. E comandos **que ficam rodando** (`dev`, `dev:web`, `start`) ocupam o terminal até `Ctrl+C`.
5. **Explicação didática:** `build:web` existe para matar a confusão do aviso "build velho" da seção 4: em vez de lembrar de `cd web` antes de buildar o front, o comando roda a partir de qualquer lugar (o `npm --prefix web` executa o script dentro de `web/`). E o `dev:web` traz o Terminal 2 do desenvolvimento para a raiz, sem trocar de pasta. Duas peças de ergonomia que nascem porque o projeto ganhou **dois modos de rodar** (dev com Vite; servido pelo back), e os atalhos deixam ambos a um comando de distância.

---

## 7. `request.http` — Passo 6: as 6 requisições novas (7.x do documento → avaliação "API vs tela")

1. **Arquivo:** `request.http`.
2. **Local no arquivo:** **No final do arquivo** (após a última requisição atual, item 41).
   - ⚠️ **Nota sobre este projeto:** o `request.http` daqui é a variante mais antiga (Fase 02/03 — itens numerados 1 a 41, com endereço direto e token JWT colado no arquivo), e não a versão com `{{baseUrl}}` da Aula 06. Para manter a numeração sem colidir com a existente (o nosso "### 6." já é "Criar tarefa com título inválido"), **numera-se 42–47** preservando os rótulos 6.1–6.6 do documento (o papel difere em nada: comparar o que o Express devolve para a API e para a tela).
3. **Antes / Depois:**
   - **Antes:** o arquivo termina no item 41 (CRUD protegido com token fixo) — nenhuma requisição testa o que o servidor devolve para as **telas**.
   - **Depois** (adicionar **no final do arquivo**):
     ```http
     # ============================================================================
     #  AULA 08 — FRONT SERVIDO PELO BACK (rode com o server.ts da Aula 08)
     #  Conferir STATUS e CONTENT-TYPE, não só o status!
     # ============================================================================

     ### 42. (6.1) GET / entrega a tela -> 200 text/html com <div id="root">
     GET http://localhost:3000/

     ### 43. (6.2) GET /tarefas é rota do React -> 200 text/html (SPA fallback)
     GET http://localhost:3000/tarefas

     ### 44. (6.3) GET /favicon.svg é arquivo do build -> 200 image/svg+xml (NÃO text/html)
     GET http://localhost:3000/favicon.svg

     ### 45. (6.4) GET /api/typo não existe na API -> 404 application/json (NÃO 200, NÃO HTML)
     GET http://localhost:3000/api/typo

     ### 46. (6.5) GET /apixyz começa com "api" mas NÃO é /api -> 200 text/html
     GET http://localhost:3000/apixyz

     ### 47. (6.6) GET /api/health — a API sobreviveu ao front -> 200
     GET http://localhost:3000/api/health
     ```
   - **O mais importante do bloco é o 45 (6.4):** ele falha **exatamente como a seção 3 descreve** se a peça (a) estiver faltando (`200` + HTML em vez de `404` + JSON). O **44 (6.3)** captura o erro que a maioria comete sem perceber: conteúdo `text/html` onde se esperava script/estilo → tela branca sem mensagem útil. **Confira o Content-Type, não só o status.**
4. **Explicação didática:** Até hoje o `request.http` testava só a **API**; a partir de agora também testamos o que o servidor entrega para o **navegador** — e a diferença é sutil demais para o olho: os seis itens parecem todos "200 OK", mas o que importa é a combinação de status + Content-Type. Espera HTML onde é tela, JSON onde é erro, imagem onde é ícone — e qualquer mistura indica que a ordem das peças do `server.ts` (ou o build do front) está errada.

---

## 8. `.gitignore` — Passo 7: o que NÃO entra no Git (arquivo novo)

1. **Arquivo:** `.gitignore` (**novo**, na raiz do projeto — conferido: não existe).
2. **Local no arquivo:** Raiz do projeto (observação: a pasta `web/` já tem seu `.gitignore` próprio, que ignora o `dist`; o da raiz cobre também o banco e as dependências do backend).
3. **Antes / Depois:**
   - **Antes:** não existe — `git status` mostra `tarefas.db` e (depois do primeiro build) `web/dist/` como mudanças a commitar.
   - **Depois** (criar o arquivo com o conteúdo completo):
     ```gitignore
     # Dependências (as duas: raiz e front)
     node_modules/

     # Build do front: é gerado por `npm run build:web`, nunca versionado.
     # Guardar no Git um build de 200 KB que qualquer um reconstrói com um comando
     # só cria conflito toda vez que duas pessoas mexerem na tela.
     web/dist/

     # Banco de dados local. Nasce sozinho na primeira execução e é zerado se for
     # apagado — versionar seria guardar o histórico de todos os alunos que
     # usaram a máquina.
     tarefas.db
     tarefas.db-journal
     *.db-wal
     *.db-shm

     # Segredos. O JWT_SECRET de verdade nunca entra no repositório.
     .env
     .env.local

     # Logs e ruído de build
     *.log
     npm-debug.log*
     ```
   - **Confirmação proposta:** depois de criar, `git status` — `node_modules/`, `web/dist/` e `tarefas.db` **não** devem aparecer na lista.
4. **Explicação didática:** Com esta aula nasce o primeiro arquivo **gerado** grande e de verdade (`web/dist`), e a pergunta ignorada é: versionar ou não? A resposta é **não**, pelos três motivos do documento: gerável por um comando (conflito inflando toda Merge Request); é artefato, não fonte; e o terceiro motivo, que surpreende: o `tarefas.db` **nasce sozinho** na primeira execução — se for versionado, cada aluno que rodar o projeto comitaria o histórico de tarefas de quem veio antes, e o arquivo voltaria diferente para cada um. Um `.gitignore` é um contrato sobre **fontes**: o Git guarda o que **nós** escrevemos, nunca o que a máquina **produz**.

---

## 9. Mão na massa — roteiro de validação

1. **Arquivo:** Não é edição — é verificação.
2. **Local no arquivo:** Terminal na raiz; navegador; `request.http` no VS Code (REST Client).
3. **Roteiro do documento (na ordem; se divergir, veja a seção 10 deste MD):**

   | # | Ação | O que você deve ver |
   |---|---|---|
   | 1 | `npm install` na raiz | `found 0 vulnerabilities` |
   | 2 | `cd web` e `npm install` | `found 0 vulnerabilities` |
   | 3 | Apagar o banco velho: `node -e "require('fs').rmSync('tarefas.db',{force:true})"` | O arquivo some (renasce na próxima execução) |
   | 4 | `npm run build:web` | `✓ built in ...` e a pasta `web/dist` aparece |
   | 5 | `npm run dev` | **Três** linhas: `Servidor rodando em`, `API:` e `Front:` — nenhum `[ATENÇÃO]` |
   | 6 | Abrir `http://localhost:3000` | A tela de login do React, **sem o Vite rodando** |
   | 7 | Entrar com `admin@senai.com` / `senha_super_secreta_123` | A lista de tarefas abre |
   | 8 | Criar uma tarefa e marcar como concluída | A lista atualiza na hora |
   | 9 | Apertar F5 | Continua logado, e a tarefa está lá |
   | 10 | DevTools → Network → recarregar | `index.html`, um `.js` e um `.css`, **todos em localhost:3000, todos 200** |
   | 11 | Digitar `http://localhost:3000/tarefas` na barra | A mesma tela do app (é o SPA fallback) |
   | 12 | Digitar algo no campo de busca | Requisição `/api/tasks?search=...` depois de ~400ms |
   | 13 | `request.http`: itens 42–47 (6.1–6.6 do documento) | Todos com status **e Content-Type** esperados |
   | 14 | Clique em Sair | Volta ao login |

   - O passo 5 é o **detector de problemas**: se aparecer `[ATENÇÃO]`, o aviso diz exatamente o que fazer. Os passos 10 e 11 provam que é o **Express** servindo (não o Vite); o 12 prova a API respondendo na mesma origem.
   - **Testes automáticos (os três sem erro):**
     ```bash
     npm run build          # na raiz — compila o backend
     cd web && npm run lint && npm run build   # front: ESLint + tsc + vite build
     ```
4. **Explicação didática:** O roteiro valida o conceito central — **um endereço só**: o passo 6 (tela sem o Vite) e o 10 (assets todos em :3000) são a prova da mesma origem; o 11 é a prova do SPA fallback; o 13 compara respostas de API e de tela lado a lado. E o passo 5 transforma os dois avisos de inicialização (build ausente/velho) em **auto-diagnóstico** do servidor: se algo estiver torto, ele mesmo te diz o remédio — `npm run build:web`.

---

## 10. Problemas comuns (tabela do documento, válida para nossa implementação)

| Sintoma | Causa provável | Solução |
|---|---|---|
| `Cannot GET /` ou erro de arquivo não encontrado | `web/dist` nunca foi gerado | `npm run build:web` |
| Tela abre mas a alteração não aparece | Build velho | `npm run build:web` e recarregar |
| Página mostra só "Ainda não existe o build" | É o 503 do passo 7.1 (intencional!) | Rodar o passo 4 do roteiro |
| Tela branca + erro de script no console | Um `.js` voltou como `text/html` | Conferir o item 44 (6.3) do `request.http` |
| `Cannot find module '.../web/dist/index.html'` | `FRONT_DIST` apontando para o lugar errado | Conferir o `__dirname` da seção 2 |
| `__dirname is not defined` | `__dirname` sem reconstruir | Usar o bloco da seção 2 |
| `Missing parameter name at index 1: *` | Curinga no estilo Express 4 | Usar `/(.*)/` ou `"/ *splat"` |
| `GET /api/typo` devolve 200 + HTML | Falta a peça (a) da seção 3 | Colocar o `app.use("/api", ...)` antes do static |
| `GET /apixyz` devolve 404 JSON | Tratamento de `/api` amplo demais | O mount é `"/api"` (por segmento), não regex solta |
| API funciona mas a tela não carrega nada | `API_BASE` fixo depois do build | Conferir seção 5 + recompilar |
| Login funciona em :5173 e não em :3000 | Build velho com `API_BASE` antiga | `npm run build:web` |
| `localhost:3000` dentro do .js no DevTools | Build velho | `npm run build:web`; conferir com o comando da seção 5 |
| Erro de pasta em `npm run build` na raiz | Usou o script do back querendo o front | Back é `npm run build`; front é `npm run build:web` |
| Erro de tipo em `express.static(FRONT_DIST)` | Constante declarada depois do uso | O bloco da seção 2 fica no topo do arquivo |
| Página sem estilo nenhum | CSS voltou como `text/html` | Ver item 44 (6.3) e conferir se `web/dist` está completo |
| `tarefas.db` aparece no `git status` | `.gitignore` da raiz não criado | Criar o arquivo da seção 8 |

---

## 11. Subir para o Git e registrar no diário

1. **Arquivo:** Não é edição de código — é commit + diário.
2. **Local no arquivo:** Terminal na raiz; arquivo novo `diario/08_servindo_front.md` (modelo em `aulas/DIARIO_DE_APRENDIZAGEM.md`).
3. **Antes / Depois (comandos):**
   ```bash
   git add .
   git commit -m "Aula 08: back servindo o front (static, SPA fallback e mesma origem)"
   git push
   ```
   Confira antes: `git status` — `node_modules/`, `web/dist/` e `tarefas.db` não devem aparecer.
4. **Explicação didática:** A mensagem do commit é literalmente o embate — o back assumindo o papel duplo (API + entrega da tela). Isso fecha a Fase 04 com o projeto como **produto de verdade**: um processo, um build e um único endereço. Registre no diário a resposta formal do curso à pergunta da aula — "preciso de CORS?" — e o porquê célula por célula: **em dev sim** (origens diferentes), **em produção não** (mesma origem).

---

## Resumo da ordem de execução

| # | Ação | Onde |
|---|------|------|
| 1 | Conferência + 2 `npm install` | raiz + `web/` |
| 2 | Imports do Node + bloco ESM/`FRONT_DIST`/`SEM_BUILD`/`maisRecente()` | `server.ts` (topo, após linha 8) |
| 3 | Três peças em ordem: (a) 404 JSON em `/api` → (b) `express.static` → (c) SPA fallback `/(.*)/` | `server.ts` (após as rotas /api, antes do listen) |
| 4 | `verificarFront()` completa + `app.listen` com 3 logins e o aviso | `server.ts` (antes do listen) |
| 5 | `API_BASE = import.meta.env.DEV ? "http://localhost:3000" : ""` | `web/src/api.ts` (linha 21 — só isso muda) |
| 6 | Atalhos `build:web` e `dev:web` | `package.json` (scripts) |
| 7 | 6 requisições novas (47 = 6.6) | `request.http` (no final) |
| 8 | `.gitignore` (novo) | raiz |
| 9 | Roteiro de 14 passos + lint/build + `request.http` | Terminal + navegador + VS Code |
| 10 | Commit, push e diário | Terminal + `diario/08_servindo_front.md` |

> **Próxima aula (09 — Banco de Dados em Nuvem, Turso/libSQL):** o processo já é um produto (um build, um endereço), mas ainda grava num arquivo do disco — e em hospedagens reais o disco é **efêmero**: o `tarefas.db` some a cada deploy. O `better-sqlite3` sai de cena e entra o `@libsql/client` (o mesmo SQLite, agora remoto). Duas consequências antecipadas: o acesso ao banco passa a ser **assíncrono** (tudo vira `await db.execute(...)`), e o `JWT_SECRET` deixa de poder ser a string de desenvolvimento — em serviço público, um segredo fixo no código é um segredo público.
