import { useState } from "react";

function App() {
  const [contador, setContador] = useState(0);

  function incrementar() {
    setContador(contador + 1);
  }

  function decrementar() {
    setContador(contador - 1);
  }
  
  return (
    <>
      <h2>Total de Cliques: { contador }</h2>
      <button onClick={incrementar}>
        Adicionar +1
      </button>
      <button onClick={decrementar}>
        Adicionar -1
      </button>
    </>
  );
}

export default App;