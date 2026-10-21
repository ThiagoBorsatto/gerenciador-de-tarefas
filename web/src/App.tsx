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
