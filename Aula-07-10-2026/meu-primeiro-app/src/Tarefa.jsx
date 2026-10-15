function Tarefa({ tarefa, onAlternar, onRemover}) {
    return(
        <li key={tarefa.id}>
            <span 
              style={{
                textDecoration: tarefa.concluido ? 'line-through' : 'none'
              }}
            >
            {tarefa.titulo} [{tarefa.categoria}]
            </span>
            {' '}
            <button onClick={() => onAlternar(tarefa.id)}>
              {tarefa.concluido ? 'Reabrir' : 'Concluir'}
            </button>
            {' '}
            <button onClick={() => onRemover(tarefa.id)}>
              Remover
            </button>
          </li>
    );
}

export default Tarefa;