import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://lista-tarefas-api.vercel.app';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregarTarefas() {
    try {
      const resposta = await fetch(`${API_URL}/tarefas`);

      if (!resposta.ok) {
        throw new Error('Erro ao buscar tarefas');
      }

      const dados = await resposta.json();
      setTarefas(dados);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTarefas();
  }, []);

  async function adicionarTarefa(event) {
    event.preventDefault();

    if (!titulo.trim()) return;

    try {
      const resposta = await fetch(`${API_URL}/tarefas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          completo: false,
        }),
      });

      if (!resposta.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const novaTarefa = await resposta.json();

      setTarefas((tarefasAtuais) => [...tarefasAtuais, novaTarefa]);
      setTitulo('');
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    }
  }

  async function alternarTarefa(tarefa) {
    try {
      const resposta = await fetch(`${API_URL}/tarefas/${tarefa.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completo: !tarefa.completo,
        }),
      });

      if (!resposta.ok) {
        throw new Error('Erro ao atualizar tarefa');
      }

      const tarefaAtualizada = await resposta.json();

      setTarefas((tarefasAtuais) =>
        tarefasAtuais.map((item) =>
          item.id === tarefaAtualizada.id ? tarefaAtualizada : item
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  }

  async function removerTarefa(id) {
    try {
      const resposta = await fetch(`${API_URL}/tarefas/${id}`, {
        method: 'DELETE',
      });

      if (!resposta.ok) {
        throw new Error('Erro ao remover tarefa');
      }

      setTarefas((tarefasAtuais) =>
        tarefasAtuais.filter((tarefa) => tarefa.id !== id)
      );
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
    }
  }

  return (
    <main className="container">
      <div className="lista-container">
        <h1>Lista de Tarefas</h1>

        <form onSubmit={adicionarTarefa} className="formulario">
          <input
            type="text"
            placeholder="Digite uma nova tarefa..."
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
          />

          <button>Adicionar</button>
        </form>

        {carregando ? (
          <p className="mensagem">Carregando tarefas...</p>
        ) : tarefas.length === 0 ? (
          <p className="mensagem">Nenhuma tarefa cadastrada.</p>
        ) : (
          <ul className="tarefas">
            {tarefas.map((tarefa) => (
              <li key={tarefa.id} className="tarefa">
                <label>
                  <input
                    type="checkbox"
                    checked={tarefa.completo}
                    onChange={() => alternarTarefa(tarefa)}
                  />

                  <span className={tarefa.completo ? 'concluida' : ''}>
                    {tarefa.titulo}
                  </span>
                </label>

                <button
                  className="botao-excluir"
                  onClick={() => removerTarefa(tarefa.id)}
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default App;
