# Plano de Ações — Aula 07: CRUD de Tarefas no React

> Origem: `07_crud_tarefas.docx`
> Pré-requisito: Aula 06 (Tela de Login) — **concluída e confirmada no projeto** (`web/src/api.ts` com as 4 funções do CRUD, Tailwind ativo, `Login.tsx` completo, e os 3 bugs do `server.ts` já corrigidos: seed com bcrypt, PATCH com `usuarioId` e `req.body ?? {}`).
> Estado atual: `App.tsx` ainda renderiza o placeholder "a lista de tarefas chega na Aula 07"; **`web/src/Tarefas.tsx` não existe** — é o arquivo novo desta aula. Nenhuma rota nova no backend: o CRUD já existe e foi testado pelo `request.http`.

> ⚠️ **Regra deste MD (mantida da correção da Aula 06):** todo bloco rotulado **"Depois"** contém o **código FINAL completo** — copie e cole **integralmente**, sem enxugar nada. Nunca existe `...` como corpo de função.

---

## 1. Conferência inicial (sem cópias — os arquivos já estão no projeto)

1. **Arquivo:** Não é edição — é conferência de pré-requisitos.
2. **Local no arquivo:** Terminal 1 na raiz (backend) e Terminal 2 em `web/` (front).
3. **Antes / Depois (comandos):**
   - O documento manda copiar `web/` inteira de uma pasta anterior (`20261014_tela_login`) **para quem começa de uma cópia** — no nosso caso os arquivos **já estão aqui**; basta conferir:
     ```text
     web/src/
     ├── api.ts      (✔ confere — com listarTarefas, criarTarefa, atualizarTarefa, deletarTarefa)
     ├── App.tsx     (✔ confere — será ALTERADO nesta aula)
     ├── Login.tsx   (✔ confere — não muda)
     ├── index.css   (✔ confere — Tailwind ativo, não muda)
     ├── main.tsx    (✔ confere — não muda)
     └── Tarefas.tsx (✘ não existe — você vai criar agora, seção 3 deste MD)
     ```
   - Instalar dependências (se ainda não estiverem) e subir o backend:
     ```bash
     # Terminal 1 — raiz
     npm install
     npm run dev
     # Deve aparecer: Servidor rodando em: http://localhost:3000 (fica rodando)

     # Terminal 2 — front
     cd web
     npm install
     ```
4. **Explicação didática:** Esta aula fecha a Fase 03: back, banco, login e agora a lista de tarefas funcionando juntos. Nada do back-end muda — ele já tem as rotas do CRUD com JWT testadas pelo `request.http`; o que falta é a **tela** que conversa com elas. A conferência da pasta `web/src/` serve para alinhar expectativas: apenas dois arquivos entram em cena (`Tarefas.tsx` novo e `App.tsx` alterado), porque o `api.ts` da Aula 06 já foi escrito olhando para frente — as quatro funções do CRUD (listar, criar, atualizar, deletar) já existem lá, prontas para hoje.

---

## 2. Conferir as funções do CRUD em `web/src/api.ts` (sem alterar)

1. **Arquivo:** `web/src/api.ts` — **NÃO alterar nada**; o documento apenas pede conferência das ferramentas disponíveis.
2. **Local no arquivo:** Fim do arquivo (seção "5. Tarefas — o CRUD").
3. **Antes / Depois:** Nenhuma alteração. O quadro de referência do documento:

   | Função | Método | Rota | Devolve |
   |---|---|---|---|
   | `listarTarefas(search)` | GET | `/api/tasks?search=` | `Tarefa[]` |
   | `criarTarefa(titulo, prioridade)` | POST | `/api/tasks` | `Tarefa` |
   | `atualizarTarefa(id, dados)` | PATCH | `/api/tasks/:id` | `Tarefa` |
   | `deletarTarefa(id)` | DELETE | `/api/tasks/:id` | `{ message }` |

   Três detalhes de ouro do documento: **(a)** o token já vai junto — quem monta o `Authorization: Bearer ...` é o `authHeaders()` interno de cada função; aqui ninguém escreve isso à mão. **(b)** `atualizarTarefa` usa **PATCH**, não PUT — parcial de propósito: concluir uma tarefa só manda `{ status: "completed" }` (com PUT, o back exigiria título e prioridade de novo, e um clique poderia apagar dados). **(c)** os erros já chegam prontos: o `tratarResposta` lança um `Error` com a mensagem do servidor, por isso o `try/catch` do componente cabe em poucas linhas.
4. **Explicação didática:** Antes de desenhar a tela, conhecemos a "bancada de ferramentas": a camada de API criada na Aula 06 centraliza endereço, token e tratamento de erro, e hoje colhemos essa fruta — o componente novo não vai saber nada de `fetch`, `localStorage` ou `res.ok`. Esse é o ganho de arquitetura da aula anterior: o `Tarefas.tsx` apenas **declara a intenção** ("crie esta tarefa", "conclua aquela") e o `api.ts` se vira com os detalhes do protocolo. Separação de responsabilidades é o mesmo padrão de "regras centralizadas" que o backend usa desde a Fase 02.

---

## 3. Criar a tela — `web/src/Tarefas.tsx` (arquivo novo)

1. **Arquivo:** `web/src/Tarefas.tsx` (**novo** — não existe).
2. **Local no arquivo:** Pasta `web/src/`, ao lado de `App.tsx` e `Login.tsx`.
3. **Antes / Depois:**
   - **Antes:** o arquivo não existe — a lista de tarefas ainda é o placeholder do `App.tsx` da Aula 06.
   - **Depois** (criar o arquivo e colar **TODO** o conteúdo abaixo — é o componente completo, com cabeçalho, formulário, busca com debounce, lista, contadores, erro e modal acessível):
     ```tsx
     /**
      * Tarefas.tsx — a tela principal do Gerenciador de Tarefas.
      *
      * É aqui que o front "conversa" com a API: lista, cria, conclui e exclui
      * tarefas. Tudo passa por api.ts, que por baixo coloca o token do usuário.
      *
      * A tela tem quatro partes visíveis:
      *   1. cabeçalho  — e-mail de quem está conectado e botão Sair
      *   2. formulário — campos de título/prioridade e busca
      *   3. lista      — as tarefas, com contador e rolagem
      *   4. modal      — confirmação antes de excluir
      */

     import { useCallback, useEffect, useRef, useState } from "react";
     import {
       atualizarTarefa,
       criarTarefa,
       deletarTarefa,
       listarTarefas,
       type Tarefa,
       type Usuario,
     } from "./api";

     // Tipos derivados de Tarefa: se o back mudar o conjunto de valores,
     // o TypeScript avisa aqui sem precisar mexer em nada.
     type Prioridade = Tarefa["prioridade"];   // "low" | "medium" | "high"
     type Status = Tarefa["status"];           // "pending" | "completed"

     /**
      * A API fala inglês (low/medium/high) porque é o contrato com o banco,
      * mas a tela fala português. Este dicionário é a tradução.
      * O Record<Prioridade, string> garante que, se o back inventar uma prioridade
      * nova, o TypeScript reclame até você traduzir aqui.
      */
     const PRIORIDADES_PT: Record<Prioridade, string> = {
       low: "Baixa",
       medium: "Média",
       high: "Alta",
     };

     /** As opções na ordem em que aparecem no <select>. */
     const PRIORIDADES: Prioridade[] = ["low", "medium", "high"];

     /** Cores do badge de prioridade, por nível. */
     const COR_PRIORIDADE: Record<Prioridade, string> = {
       low: "bg-slate-700/60 text-slate-300 ring-slate-600",
       medium: "bg-amber-500/15 text-amber-300 ring-amber-500/40",
       high: "bg-rose-500/15 text-rose-300 ring-rose-500/40",
     };

     /** Quanto tempo esperamos a pessoa parar de digitar antes de buscar. */
     const DEBOUNCE_MS = 400;

     /** Extrai a mensagem de erro de qualquer coisa que tenha sido lançada. */
     function mensagemDe(erro: unknown, padrao: string): string {
       return erro instanceof Error ? erro.message : padrao;
     }

     // ---------------------------------------------------------------------------
     // O componente
     // ---------------------------------------------------------------------------

     interface TarefasProps {
       /** Quem está logado — vem do App, que decodificou o token. */
       usuario: Usuario;
       /** Volta para a tela de login (o App é quem apaga o token). */
       aoSair: () => void;
     }

     export default function Tarefas({ usuario, aoSair }: TarefasProps) {
       // --- dados ---------------------------------------------------------------
       const [tarefas, setTarefas] = useState<Tarefa[]>([]);
       const [carregando, setCarregando] = useState(true);
       const [erro, setErro] = useState("");

       // --- busca ---------------------------------------------------------------
       // Dois estados de propósito: `busca` é o que está na caixa de texto (muda a
       // cada tecla) e `buscaAplicada` é o que realmente vai para a API. Sem essa
       // separação, cada tecla dispararia uma requisição.
       const [busca, setBusca] = useState("");                 // muda a cada tecla
       const [buscaAplicada, setBuscaAplicada] = useState(""); // vai para a API

       // --- formulário de criação ----------------------------------------------
       const [titulo, setTitulo] = useState("");
       const [prioridade, setPrioridade] = useState<Prioridade>("medium");
       const [criando, setCriando] = useState(false);

       // --- modal de exclusão ---------------------------------------------------
       const [paraExcluir, setParaExcluir] = useState<Tarefa | null>(null);

       /**
        * Guarda o id da requisição em andamento. Serve para descartar respostas
        * antigas: se você digita "c", "ca", "cas" rápido, as três requisições saem
        * juntas e nem sempre voltam na ordem. Sem esta trava, a resposta do "c"
        * poderia chegar por último e sobrescrever a lista com o resultado errado.
        */
       const requisicaoAtual = useRef(0);

       /**
        * O termo que foi REALMENTE enviado para a API na última vez.
        *
        * Serve para o efeito de debounce saber se o valor mudou de verdade. Um
        * useState não serviria: aqui o valor só interessa lá dentro do setTimeout,
        * e não no próximo render.
        */
       const ultimaBusca = useRef("");

       /** Esta resposta ainda interessa, ou outra requisição já começou? */
       const aindaValida = (meuId: number): boolean =>
         meuId === requisicaoAtual.current;

       /**
        * Recarrega a lista. Usada pelos botões (criar, concluir, excluir) depois
        * de uma alteração, para a tela refletir o que o banco gravou.
        */
       const carregar = useCallback(async (): Promise<void> => {
         const meuId = ++requisicaoAtual.current;

         try {
           const dados = await listarTarefas(buscaAplicada);
           if (!aindaValida(meuId)) return;
           setTarefas(dados);
           // Limpamos o aviso só depois do sucesso, para uma falha antiga não
           // piscar na tela enquanto a nova requisição ainda está em voo.
           setErro("");
         } catch (e) {
           if (!aindaValida(meuId)) return;
           setErro(mensagemDe(e, "Não foi possível carregar suas tarefas."));
         } finally {
           if (aindaValida(meuId)) setCarregando(false);
         }
       }, [buscaAplicada]);

       /**
        * Efeito 1 — o "debounce". Espera a digitação parar antes de aplicar a busca.
        * O return é a função de limpeza: se a pessoa digitar mais, o React roda ela
        * primeiro, cancelando o setTimeout anterior. É o que evita o "efeito máquina
        * de escrever" na API.
        *
        * O setCarregando fica dentro do setTimeout de propósito: ali ele já roda
        * assíncrono, então não provoca um render extra logo no começo do efeito.
        *
        * E a linha do `if` é o que impede um bug muito confuso. Na montagem, `busca`
        * e `ultimaBusca` já valem "": o timer dispara 400ms depois e não muda nada.
        * Se marcássemos "carregando" assim mesmo, a tela entraria em "Carregando..."
        * e nunca mais sairia, porque sem busca nova não existe resposta para
        * desligar a flag. A lista apareceria por um instante e sumiria.
        */
       useEffect(() => {
         const temporizador = setTimeout(() => {
           const termo = busca.trim();

           // Nada mudou de verdade: não busca e não mexe no "carregando".
           if (termo === ultimaBusca.current) return;

           ultimaBusca.current = termo;
           setBuscaAplicada(termo);
           setCarregando(true);
         }, DEBOUNCE_MS);
         return () => clearTimeout(temporizador);
       }, [busca]);

       /**
        * Efeito 2 — busca os dados na abertura e a cada busca aplicada.
        *
        * Repare que o estado só é tocado DENTRO dos callbacks do .then, nunca no
        * corpo do efeito. É o padrão recomendado pelo React para buscar dados: se
        * atualizássemos estado direto aqui, teríamos um render em cascata
        * desnecessário logo na montagem.
        *
        * São duas proteções, com papeis diferentes:
        *   - `montado` é a limpeza do efeito. Se a tela sair (ou a busca mudar
        *     antes da resposta chegar), a resposta chega tarde e é ignorada.
        *   - `aindaValida(meuId)` é a trava contra respostas fora de ordem, e
        *     vale inclusive para as requisições disparadas pelos botões.
        */
       useEffect(() => {
         const meuId = ++requisicaoAtual.current;
         let montado = true;

         listarTarefas(buscaAplicada).then(
           (dados) => {
             if (!montado || !aindaValida(meuId)) return;
             setTarefas(dados);
             setErro("");
             setCarregando(false);
           },
           (e: unknown) => {
             if (!montado || !aindaValida(meuId)) return;
             setErro(mensagemDe(e, "Não foi possível carregar suas tarefas."));
             setCarregando(false);
           },
         );

         return () => {
           montado = false;
         };
       }, [buscaAplicada]);

       // --- criar ---------------------------------------------------------------
       const criar = async (e: React.FormEvent): Promise<void> => {
         e.preventDefault();

         const tituloLimpo = titulo.trim();
         if (tituloLimpo.length < 3) {
           setErro("O título precisa ter ao menos 3 caracteres.");
           return;
         }

         setCriando(true);
         setErro("");

         try {
           await criarTarefa(tituloLimpo, prioridade);
           setTitulo("");
           setPrioridade("medium");
           await carregar();
         } catch (e) {
           setErro(mensagemDe(e, "Não foi possível criar a tarefa."));
         } finally {
           setCriando(false);
         }
       };

       // --- concluir / reabrir --------------------------------------------------
       const alternarStatus = async (tarefa: Tarefa): Promise<void> => {
         const novoStatus: Status =
           tarefa.status === "completed" ? "pending" : "completed";

         setErro("");
         try {
           await atualizarTarefa(tarefa.id, { status: novoStatus });
           await carregar();
         } catch (e) {
           setErro(mensagemDe(e, "Não foi possível atualizar a tarefa."));
         }
       };

       // --- excluir -------------------------------------------------------------
       const confirmarExcluir = async (): Promise<void> => {
         if (!paraExcluir) return;
         const alvo = paraExcluir;

         // Fecha o modal na hora: o clique já foi confirmado, não faz sentido
         // deixar a janela aberta esperando a resposta da rede.
         setParaExcluir(null);
         setErro("");

         try {
           await deletarTarefa(alvo.id);
           await carregar();
         } catch (e) {
           setErro(mensagemDe(e, "Não foi possível excluir a tarefa."));
         }
       };

       // --- acessibilidade do modal --------------------------------------------
       // Ao abrir, o foco vai para o botão de confirmar, para quem navega só com o
       // teclado saber imediatamente onde está.
       const botaoConfirmar = useRef<HTMLButtonElement>(null);

       useEffect(() => {
         if (paraExcluir) botaoConfirmar.current?.focus();
       }, [paraExcluir]);

       // Esc fecha o modal. Só fica de escuta quando o modal está aberto.
       useEffect(() => {
         if (!paraExcluir) return;

         const aoTeclar = (e: KeyboardEvent): void => {
           if (e.key === "Escape") setParaExcluir(null);
         };

         document.addEventListener("keydown", aoTeclar);
         return () => document.removeEventListener("keydown", aoTeclar);
       }, [paraExcluir]);

       // --- contadores ----------------------------------------------------------
       const total = tarefas.length;
       const concluidas = tarefas.filter((t) => t.status === "completed").length;
       const pendentes = total - concluidas;

       return (
         <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-10">
           {/* ---------------------------------------------------------- 1. cabeçalho */}
           <header className="flex flex-wrap items-start justify-between gap-4">
             <div>
               <h1 className="text-3xl font-extrabold tracking-tight text-white">
                 Minhas Tarefas
               </h1>
               <p className="mt-1 text-sm text-slate-400">
                 Conectado como <span className="text-slate-200">{usuario.email}</span>
               </p>
             </div>

             <button
               type="button"
               onClick={aoSair}
               className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
             >
               Sair
             </button>
           </header>

           {/* ------------------------------------------------------- 2. criar tarefa */}
           <form
             onSubmit={criar}
             className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 sm:flex-row"
           >
             <div className="flex-1">
               <label
                 htmlFor="titulo"
                 className="sr-only"
               >
                 Título da nova tarefa
               </label>
               <input
                 id="titulo"
                 type="text"
                 value={titulo}
                 onChange={(e) => setTitulo(e.target.value)}
                 placeholder="O que precisa ser feito?"
                 maxLength={120}
                 className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
               />
             </div>

             <div>
               <label
                 htmlFor="prioridade"
                 className="sr-only"
               >
                 Prioridade
               </label>
               <select
                 id="prioridade"
                 value={prioridade}
                 onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                 className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none sm:w-auto"
               >
                 {PRIORIDADES.map((p) => (
                   <option key={p} value={p}>
                     {PRIORIDADES_PT[p]}
                   </option>
                 ))}
               </select>
             </div>

             <button
               type="submit"
               disabled={criando}
               className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:opacity-50"
             >
               {criando ? "Criando..." : "Adicionar"}
             </button>
           </form>

           {/* ------------------------------------------------------------- 3. busca */}
           <div className="flex flex-col gap-2">
             <label
               htmlFor="busca"
               className="text-sm font-medium text-slate-300"
             >
               Buscar por título
             </label>
             <input
               id="busca"
               type="search"
               value={busca}
               onChange={(e) => setBusca(e.target.value)}
               placeholder="Digite para filtrar..."
               className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none"
             />
           </div>

           {/* -------------------------------------------------------------- 4. erro */}
           {erro && (
             <div
               role="alert"
               className="flex items-start justify-between gap-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
             >
               <span>{erro}</span>
               <button
                 type="button"
                 onClick={() => setErro("")}
                 aria-label="Fechar aviso"
                 className="shrink-0 text-rose-300 transition hover:text-white"
               >
                 ×
               </button>
             </div>
           )}

           {/* ------------------------------------------------------------- 5. lista */}
           <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
             {/* aria-live faz o leitor de tela anunciar a contagem a cada mudança */}
             <p
               aria-live="polite"
               className="mb-3 text-sm text-slate-400"
             >
               {carregando
                 ? "Carregando..."
                 : `${pendentes} pendente(s) e ${concluidas} concluída(s).`}
             </p>

             {carregando ? (
               <p className="py-6 text-center text-sm text-slate-500">
                 Buscando suas tarefas...
               </p>
             ) : total === 0 ? (
               <div className="py-10 text-center">
                 <p className="text-slate-300">
                   {buscaAplicada
                     ? `Nenhuma tarefa contém "${buscaAplicada}".`
                     : "Nenhuma tarefa por aqui ainda."}
                 </p>
                 <p className="mt-1 text-sm text-slate-500">
                   {buscaAplicada
                     ? "Tente outro termo de busca."
                     : "Use o formulário acima para criar a primeira."}
                 </p>
               </div>
             ) : (
               <ul className="flex max-h-[60vh] list-none flex-col gap-2 overflow-y-auto p-0 pr-1">
                 {tarefas.map((t) => {
                   const feita = t.status === "completed";

                   return (
                     <li
                       key={t.id}
                       className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                     >
                       <div className="min-w-0 flex-1">
                         <p
                           className={`truncate text-sm ${
                             feita
                               ? "text-slate-500 line-through"
                               : "text-slate-100"
                           }`}
                         >
                           {t.titulo}
                         </p>
                         <span
                           className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ring-1 ${COR_PRIORIDADE[t.prioridade]}`}
                         >
                           {PRIORIDADES_PT[t.prioridade]}
                         </span>
                       </div>

                       <div className="flex shrink-0 gap-2">
                         <button
                           type="button"
                           onClick={() => void alternarStatus(t)}
                           className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                         >
                           {feita ? "Reabrir" : "Concluir"}
                         </button>

                         <button
                           type="button"
                           onClick={() => setParaExcluir(t)}
                           className="rounded border border-rose-500/40 px-3 py-1 text-xs text-rose-300 transition hover:border-rose-400 hover:text-rose-200"
                         >
                           Excluir
                         </button>
                       </div>
                     </li>
                   );
                 })}
               </ul>
             )}
           </div>

           {/* ------------------------------------------------------- 6. modal de exclusão */}
           {paraExcluir && (
             <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
               // Clicar no fundo (fora do cartão) cancela.
               onClick={() => setParaExcluir(null)}
             >
               <div
                 role="dialog"
                 aria-modal="true"
                 aria-labelledby="titulo-modal"
                 onClick={(e) => e.stopPropagation()}
                 className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-xl"
               >
                 <h2
                   id="titulo-modal"
                   className="text-lg font-semibold text-white"
                 >
                   Excluir esta tarefa?
                 </h2>

                 <p className="mt-2 text-sm text-slate-400">
                   <span className="text-slate-200">{paraExcluir.titulo}</span> será
                   removida permanentemente. Não dá para desfazer.
                 </p>

                 <div className="mt-5 flex justify-end gap-2">
                   <button
                     type="button"
                     onClick={() => setParaExcluir(null)}
                     className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
                   >
                     Cancelar
                   </button>

                   <button
                     ref={botaoConfirmar}
                     type="button"
                     onClick={() => void confirmarExcluir()}
                     className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                   >
                     Excluir
                   </button>
                 </div>
               </div>
             </div>
           )}
         </div>
       );
     }
     ```
4. **Explicação didática:** Este é o componente mais completo do curso até agora, e o documento pede que você o digite **lendo os comentários** (não cole às cegas). Quatro lições embutidas: (1) **a busca tem duas partes** — dois estados (`busca` muda a cada tecla; `buscaAplicada` é o que vai à API) e um *debounce* de 400ms no efeito 1, cuja limpeza (`clearTimeout`) cancela o timer anterior a cada tecla — digitar "React" gera **uma** requisição, não cinco; o `if` dentro do timer não é decoração: sem ele, a lista carregar e sumir 400ms depois (presa em "Carregando..."). (2) **respostas fora de ordem**: o contador `requisicaoAtual` (useRef) identifica cada requisição e `aindaValida` descarta as atrasadas — a busca por "cas" não pode sobrescrever a de "casa". (3) **formulário controlado**: o valor vive no estado (nunca no DOM), e após qualquer ação a regra é "grava, depois relê" (`await carregar()`), porque a tela sempre pede a lista ao back. (4) **exclusão com confirmação acessível**: o botão da lista só marca `paraExcluir`; o modal só existe no DOM quando há algo marcado (`{paraExcluir && ...}`, não `display:none`), se anuncia como `role="dialog"`, recebe foco no "Excluir" ao abrir, fecha com Esc e trata o clique fora com `stopPropagation`. Os tipos (`Prioridade`, `Status`) são **derivados** de `Tarefa` do `api.ts`, e o dicionário `PRIORIDADES_PT` traduz low/medium/high para a tela sem alterar o que vai ao back.

---

## 4. Ligar no `App.tsx`

1. **Arquivo:** `web/src/App.tsx`.
2. **Local no arquivo:** Todo o conteúdo (substituição completa).
3. **Antes / Depois:**
   - **Antes** (versão atual, da Aula 06 — placeholder desta aula):
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
   - **Depois** (apagar tudo e colar **TODO** o conteúdo abaixo):
     ```tsx
     /**
      * App.tsx — o "cérebro" da aplicação: decide qual tela mostrar.
      *
      * Existem dois estados possíveis:
      *   - deslogado -> mostra o <Login />
      *   - logado    -> mostra o <Tarefas />
      *
      * O App não sabe nada sobre tarefas: ele só guarda QUEM está logado e
      * entrega essa informação para a tela seguinte. Quem manda na lista de
      * tarefas é o próprio Tarefas.tsx.
      */

     import { useState } from "react";
     import Login from "./Login";
     import Tarefas from "./Tarefas";
     import { clearToken, getUsuario, type Usuario } from "./api";

     export default function App() {
       /**
        * O useState recebe uma FUNÇÃO como valor inicial. O React entende que
        * aquilo é uma "fábrica" e a chama uma única vez, já no primeiro render.
        *
        * Por que não getUsuario() direto? Porque a cada re-render o par
        * [usuario, setUsuario] é recriado. Se chamássemos direto, o token seria
        * lido e decodificado a cada tecla digitada na tela.
        */
       const [usuario, setUsuario] = useState<Usuario | null>(() => getUsuario());

       /**
        * Derivamos o "está logado?" do próprio usuario, em vez de guardar dois
        * estados que poderiam ficar dessincronizados (ex.: logado=true e usuario=null).
        *
        * Por isso NÃO existe um setLogado neste arquivo: quem loga e quem sai é o
        * usuario. Um estado a menos para manter em dia, uma classe de bug a menos.
        */
       const logado = usuario !== null;

       /** Chamado pelo Login quando a autenticação dá certo. */
       const aoLogar = (): void => {
         setUsuario(getUsuario());
       };

       /**
        * Chamado pelo botão "Sair" do Tarefas.
        *
        * Repare que o apagamento do token acontece AQUI, e não dentro do Tarefas.
        * Quem cuida da sessão é o App; a tela de tarefas só avisa "a pessoa pediu
        * para sair". Assim existe um único lugar no projeto que apaga o token.
        */
       const aoSair = (): void => {
         clearToken();
         setUsuario(null);
       };

       if (!logado) {
         return <Login aoLogar={aoLogar} />;
       }

       return <Tarefas usuario={usuario} aoSair={aoSair} />;
     }
     ```
   - O que mudou de verdade: saiu o placeholder ("Bem-vindo... a lista chega na Aula 07") e entrou `<Tarefas usuario={usuario} aoSair={aoSair} />`. **Não existe `setLogado`** — o documento alerta que o material antigo mostrava `setLogado(true/false)`, mas esse estado não deve ser criado: `logado` é derivado de `usuario`. E o `Sair` **fica no App** (dono da sessão), não no Tarefas — um único lugar no projeto que apaga o token.
4. **Explicação didática:** O `App.tsx` não aprende nada sobre tarefas — e é essa a lição. Ele continua sendo apenas o "porteiro": guarda quem está logado (lendo o token uma única vez, via função-fábrica no `useState`) e entrega ao componente de baixo as duas coisas que ele precisa, o usuário (para exibir o e-mail) e o gatilho de saída. O `Tarefas.tsx` manda na lista; o `App` manda na sessão. Evitar `setLogado` evita a classe de bug em que dois estados que representam a mesma verdade (`logado` e `usuario`) saem de sincronia; centralizar o `clearToken` no App evita duplicação de responsabilidade. Componentes pequenos e especializados são fáceis de ler, testar e evoluir — o placeholder "barato" de ontem vira hoje só uma troca de componente.

---

## 5. Rodar e validar (terminal + navegador)

1. **Arquivo:** Não é edição — é verificação.
2. **Local no arquivo:** Terminal 1 (raiz, backend) e Terminal 2 (`web/`); navegador em `http://localhost:5173`; `request.http` da raiz com a extensão REST Client.
3. **Antes / Depois (comandos e roteiro):**
   ```bash
   # Terminal 1 — raiz (a API)
   npm run dev
   # Deve aparecer: Servidor rodando em: http://localhost:3000

   # Terminal 2 — web/ (a tela)
   npm run dev
   # Abra o endereço que o Vite mostrar (em geral http://localhost:5173)
   ```
   - ⚠️ **Nota de correção (aplicada em 22/10/2026) — o `npm run build` na raiz precisava de 2 ajustes de infraestrutura antes de compilar:**
     1. **Faltava `tsconfig.json` na raiz** (o documento citava ele entre os arquivos do projeto, mas ele nunca foi criado). Sem o tsconfig, o `tsc` não sabe o que compilar e apenas **exibe o manual de ajuda** (aquele dump de flags do terminal) — não é erro de código. **Arquivo:** `tsconfig.json` (**novo**, na raiz, ao lado de `package.json`). Conteúdo aplicado:
        ```json
        {
          "compilerOptions": {
            "target": "es2022",
            "module": "nodenext",
            "moduleResolution": "nodenext",
            "strict": true,
            "esModuleInterop": true,
            "skipLibCheck": true,
            "noEmit": true
          },
          "include": ["server.ts"]
        }
        ```
        *Explicação didática:* o `tsc` sem argumentos procura o `tsconfig.json` na pasta atual; sem ele, só imprime a ajuda. O `"include": ["server.ts"]` declara o que o projeto de backend contém; `"strict": true` ativa a checagem rigorosa de tipos; `"module": "nodenext"` é o modo correto para Node moderno (o `package.json` já usa `"type": "module"`); e `"noEmit": true` faz o build **apenas checar os tipos sem gerar arquivos JS** — e é por isso que agora ele conseguiu dizer, de verdade, o que estava errado no código: os três erros listados abaixo só apareciam em tempo de execução antes (o `tsx` roda o TS sem verificar tipos).
     2. **Com o tsconfig no lugar, o compilador expôs 3 erros reais em `server.ts`** — nas linhas das rotas DELETE/PUT/PATCH: `req.params.id` (com os tipos do Express 5) pode ser `string | string[]`, mas `parsearId` espera `string`. **Arquivo:** `server.ts` (3 locais — as chamadas a `parsearId`). **Antes:**
        ```ts
        const idParaDeletar = parsearId(req.params.id);
        // (igual nos app.put e app.patch)
        ```
        **Depois:**
        ```ts
        const idParaDeletar = parsearId(String(req.params.id));
        ```
        *Explicação didática:* `String(req.params.id)` converte com segurança — se vier `["abc"]` vira `"abc"`. O `tsx` deixava passar porque ele transpila TypeScript para JS **sem checar tipos**; o `tsc` é o compilador de verdade, e agora o build validate de verdade. (Mesma lição do `req.body` da Aula 06: erros de tipo que só existem em execução.)
     - **Verificação automática (antes ou depois do roteiro — os três devem terminar sem erro):**
     ```bash
     # na raiz: compila o back-end (TypeScript)
     npm run build

     # em web/: passa o ESLint e compila o front
     cd web
     npm run lint
     npm run build
     ```
   - **Roteiro de validação do documento (na ordem; se divergir, veja a seção 7 deste MD):**

     | # | Faça | O que precisa acontecer |
     |---|---|---|
     | 1 | Entre com `admin@senai.com` / `senha_super_secreta_123` | Abre a lista, vazia, com "nenhuma tarefa ainda" |
     | 2 | Escreva "Comprar pão", prioridade Alta | A tarefa entra na lista e o campo fica vazio |
     | 3 | Repita com 2–3 tarefas de prioridades diferentes | Cada badge mostra Baixa, Média ou Alta |
     | 4 | Clique Concluir | Título riscado e botão vira "Reabrir" |
     | 5 | Clique Reabrir | O risco some e o botão volta a "Concluir" |
     | 6 | Digite "com" na busca | A lista filtra sozinha, ~meio segundo depois |
     | 7 | Apague a busca | A lista volta ao completo |
     | 8 | Digite "zzz" | Mensagem de que nada foi encontrado, citando o termo |
     | 9 | Clique Excluir | Abre o modal com o título; nada é excluído ainda |
     | 10 | Clique Cancelar | Modal fecha e a tarefa continua lá |
     | 11 | Abra de novo e feche com Esc | Modal fecha, sem excluir |
     | 12 | Abra de novo e confirme em Excluir | A tarefa some da lista |
     | 13 | Clique Sair | Volta à tela de login |
     | 14 | Recarregue com F5 | **Continua logado** (token no localStorage) |
     | 15 | Clique Sair e recarregue | Volta ao login (token apagado) |

     O passo 14 é o mais importante: prova que a sessão sobrevive ao recarregar — o token está no `localStorage` e o App o decodifica no primeiro render. Cair para o login nesse passo significaria que a Aula 06 não está funcionando.
   - **Testes de API (REST Client):** o `request.http` continua valendo — 38 requisições em ordem (1.1 → 5.6). Os blocos 3 e 4 exercitam o CRUD que hoje a tela consome; o bloco 5 prova o isolamento entre usuários. Lembrete: rode em ordem — o item 2.5 captura o token automaticamente.
4. **Explicação didática:** A validação ganhou duas camadas novas nesta aula: os **dois terminais lado a lado** revelam em tempo real o comentário entre front e back (cada clique na tela gera uma requisição visível no console do backend), e o **roteiro de 15 passos** testa comportamento — não código: concluir/rasurar, debounce da busca (meio segundo de espera é intencional!), modal nas três formas de fechar (botão, Esc, clique fora) e a persistência da sessão. Rodar `npm run build` na raiz e em `web/` garante que os dois mundos continuam compilando — o TypeScript acusando quebras antes de chegar ao navegador.

---

## 6. Subir para o Git e registrar no diário (terminal)

1. **Arquivo:** Não é edição de código — é commit + criação do diário.
2. **Local no arquivo:** Terminal na raiz do projeto; arquivo novo `diario/07_crud_tarefas.md` (modelo em `aulas/DIARIO_DE_APRENDIZAGEM.md`).
3. **Antes / Depois (comandos):**
   ```bash
   git add .
   git commit -m "Aula 07: CRUD de tarefas no React + modal de exclusao"
   git push
   ```
4. **Explicação didática:** Com este commit a Fase 03 fecha por completo — tela, API, banco e login funcionando juntos, fechando o círculo de uma aplicação web real. A mensagem de commit menciona o modal de exclusão propositalmente: na história do projeto, o momento em que "apagar deixa de ser acidental e passa a ter confirmação" é um marco de maturidade da interface. Registre no diário o que mais te custou (provavelmente o debounce ou a trava de respostas fora de ordem — os conceitos novos desta aula).

---

## Pontos de atenção desta implementação (alertas do documento)

1. **Busca = dois estados + debounce.** O padrão ingênuo (um `useState` + `useEffect` com `[]`) deixa o campo de busca inerte: o efeito roda só na montagem e lê o `search` do closure vazio. Sintoma silencioso — sem erro no console, "parece que a API não filtra".
2. **`App.tsx` deriva `logado` de `usuario`** — não existe `setLogado`; material antigo mostrava `setLogado(true/false)` e isso está errado: criar esse estado é pedir para ter estados dessincronizados.
3. **O componente está completo no arquivo.** Todos os estados, efeitos, handlers e JSX no mesmo `Tarefas.tsx` — **copiar trechos soltos não produz um componente que compila** (lição da Aula 06!). Caminho: `web/src/Tarefas.tsx`.
4. **Estados de UI + acessibilidade:** `carregando` com mensagens claras, lista vazia amigável, erro visível (fechável), modal com `role="dialog"`/`aria-modal`/Esc/foco no confirmar.

---

## Problemas comuns (tabela de troubleshooting do documento)

| Sintoma | Causa provável | Solução |
|---|---|---|
| A tela de tarefas nunca aparece | Sem token no localStorage | Faça login de novo e confira o e-mail |
| "Falha ao buscar" no console | Back-end (:3000) parado | Volte ao Terminal 1 e confira `npm run dev` |
| Página abre sem estilo nenhum | Falta da pasta `web/` da Aula 06 | Neste projeto: conferir `index.css` e `vite.config.ts` do Tailwind (já OK) |
| `Cannot find module 'react'` | `npm install` rodou só na raiz | Rode também dentro de `web/` |
| Busca filtra mas devolve lista vazia | Acento diferente do título | A busca não ignora maiúsculas e acento conta: "cafe" não acha "café" |
| A lista não rola, só cresce | Faltou `max-h-[60vh]` e `overflow-y-auto` | Confira a classe no `<ul>` |
| Modal só fecha pelo botão | Faltou o `useEffect` do Escape | Revisar a seção do modal (7.9 do documento / código da seção 3 aqui) |
| Clicar em "Excluir" recarrega a página | Botão sem `type="button"` | Todo botão fora do `<form>` precisa de `type="button"` |
| Erro de tipo em `atualizarTarefa` | Mandando o objeto inteiro | O 2º argumento é `Partial<...>`: mande só o que muda |
| `react-hooks/exhaustive-deps reclamando` | Dependência faltando no array | Quase sempre é o array do `useEffect` incompleto |
| `set-state-in-effect` reclamando no lint | Estado mudado no corpo do efeito | Mova o `setX` para dentro do `.then()` |

---

## Resumo da ordem de execução

| # | Ação | Onde |
|---|------|------|
| 1 | Conferência de `web/src/` + 2 terminais + backend rodando | Terminal raiz + `web/` |
| 2 | Conferir as 4 funções do CRUD (NÃO alterar) | `web/src/api.ts` (leitura) |
| 3 | Criar a tela completa (cabeçalho, form, busca, lista, modal) | `web/src/Tarefas.tsx` (novo — código final na seção 3) |
| 4 | Trocar o placeholder pelo `<Tarefas>` | `web/src/App.tsx` (substituir — seção 4) |
| 5 | `npm run build` (raiz) + `npm run lint` + `npm run build` (web) + roteiro de 15 passos + `request.http` | Terminal + navegador — ⚠️ ver Nota de correção na seção 5 (`tsconfig.json` novo + `String(req.params.id)` em 3 locais) |
| 6 | Commit, push e diário | Terminal + `diario/07_crud_tarefas.md` |

> **Próxima aula (08):** o próprio `server.ts` passa a entregar os arquivos do React — um único endereço, sem CORS e sem segundo terminal.
