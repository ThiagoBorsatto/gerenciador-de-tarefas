import { use, useState } from "react";
import Tarefa from "./Tarefa";

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [categorias, setCategorias] = useState('Estudo');

  function adicionarTarefa(evento) {
    evento.preventDefault();

    const tituloLimpo = novoTitulo.trim();

    if (tituloLimpo.length < 3) {
      return alert("Título tem que ter mais que 3 caracteres!");
    }

    const novaTarefa = {
      id: Date.now(),
      titulo: tituloLimpo,
      concluido: false,
      categoria: categorias
    };

    setTarefas(listaAtual => [...listaAtual, novaTarefa]);
    setNovoTitulo('');
  }

  function alternarTarefa(id) {
    setTarefas(listaAtual =>
      listaAtual.map( tarefa =>
        tarefa.id === id
          ? { ...tarefa, concluido: !tarefa.concluido }
          : tarefa
      )
    );
  }

  function removerTarefa(id) {
    setTarefas(listaAtual =>
      listaAtual.filter(tarefa => tarefa.id !== id)
    );
  }

  const totalPendentes = tarefas.filter(tarefa => !tarefa.concluido).length;
  const totalConcluida = tarefas.filter(tarefa => tarefa.concluido).length;

  function mensagemPendentes() {
    if (tarefas.length === 0) {
      return 'Nenhuma tarefa ainda.';
    }

    if (totalPendentes === 0) {
      return 'Todas as tarefas foram concluídas!';
    }

    return `Tarefas Pendentes: ${totalPendentes}`;
  }

  return (
    <main>
      <h1>Minha lista de Tarefas</h1>
      <p>Organize suas tarefas do dia.</p>

      <form onSubmit={adicionarTarefa}>
        <label htmlFor="tituloTarefa">Nova Tarefa</label>
        <br></br>
        <input 
          id="tituloTarefa"
          type="Text"
          value={novoTitulo}
          onChange={evento => setNovoTitulo(evento.target.value)}
          placeholder="Ex. Estudar React"
        />
        <select value={categorias} onChange={evento => setCategorias(evento.target.value)}>
          <option value="Estudo">Estudo</option>
          <option value="Casa">Casa</option>
          <option value="Trabalho">Trabalho</option>
        </select>
        <button type="submit">Adicionar</button>
      </form>

      <ul>
        {tarefas.map((tarefa) => (
          <Tarefa 
            key={tarefa.id}
            tarefa={tarefa}
            onAlternar={alternarTarefa}
            onRemover={removerTarefa}
          />
        ))}
      </ul>

      <p>Total de tarefas: {tarefas.length}</p>
      <p>Total de tarefas concluídas: {totalConcluida}</p>
      <p>{mensagemPendentes()}</p>
    </main>
  );

}

export default App;