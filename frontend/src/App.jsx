import { useEffect, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://lista-tarefas-api.vercel.app';

function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('usuario')) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem('token') || ''
  );

  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const [lembretesAtivos, setLembretesAtivos] = useState(
  () =>
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted'
);

  function encerrarSessao() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    setToken('');
    setUsuario(null);
    setTarefas([]);
    setTitulo('');
    setSenha('');
    setMensagem('');
  }

  async function requisicaoAutenticada(caminho, opcoes = {}) {
    const resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...opcoes.headers,
      },
    });

    if (resposta.status === 401) {
      encerrarSessao();
      throw new Error('Sua sessão expirou. Entre novamente.');
    }

    return resposta;
  }

  async function carregarTarefas() {
    if (!token) return;

    setCarregando(true);

    try {
      const resposta = await requisicaoAutenticada('/tarefas');

      if (!resposta.ok) {
        throw new Error('Não foi possível carregar as tarefas.');
      }

      setTarefas(await resposta.json());
    } catch (error) {
      setMensagem(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function ativarLembretes() {
  if (!('Notification' in window)) {
    setMensagem('Seu navegador não suporta notificações.');
    return;
  }

  const permissao = await Notification.requestPermission();

  if (permissao === 'granted') {
    setLembretesAtivos(true);
    setMensagem('Lembretes ativados para as 20h!');
  } else {
    setMensagem('Permita as notificações no navegador para ativar os lembretes.');
  }
}

  useEffect(() => {
    if (token) carregarTarefas();
  }, [token]);

  useEffect(() => {
  if (!token || !usuario || !lembretesAtivos) return;

  function verificarLembrete() {
    const agora = new Date();
    const hora = agora.getHours();

    if (hora < 20) return;

    const pendentes = tarefas.filter(
      (tarefa) => !tarefa.completo
    );

    if (pendentes.length === 0) return;

    const data = [
      agora.getFullYear(),
      String(agora.getMonth() + 1).padStart(2, '0'),
      String(agora.getDate()).padStart(2, '0'),
    ].join('-');

    const chave = `lembrete-${usuario.email}-${data}`;

    if (localStorage.getItem(chave)) return;

    new Notification('Lembrete de tarefas', {
      body: `Você tem ${pendentes.length} tarefa(s) pendente(s). Que tal concluí-las?`,
    });

    localStorage.setItem(chave, 'enviado');
  }

  verificarLembrete();

  const intervalo = setInterval(verificarLembrete, 30000);

  return () => clearInterval(intervalo);
}, [token, usuario, tarefas, lembretesAtivos]);

  async function autenticar(event) {
    event.preventDefault();
    setMensagem('');

    const rota = modo === 'cadastro' ? '/auth/register' : '/auth/login';

    try {
      const resposta = await fetch(`${API_URL}${rota}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || dados.mensagem || 'Falha na autenticação.');
      }

      if (modo === 'cadastro') {
        setModo('login');
        setSenha('');
        setMensagem('Cadastro realizado! Entre com seu email e senha.');
        return;
      }

      sessionStorage.setItem('token', dados.token);
      sessionStorage.setItem('usuario', JSON.stringify(dados.usuario));
      setToken(dados.token);
      setUsuario(dados.usuario);
      setSenha('');
      setMensagem('');
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function adicionarTarefa(event) {
    event.preventDefault();

    if (!titulo.trim()) return;

    try {
      const resposta = await requisicaoAutenticada('/tarefas', {
        method: 'POST',
        body: JSON.stringify({ titulo: titulo.trim(), completo: false }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao criar tarefa.');
      }

      setTarefas((atuais) => [...atuais, dados]);
      setTitulo('');
      setMensagem('');
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function alternarTarefa(tarefa) {
    try {
      const resposta = await requisicaoAutenticada(`/tarefas/${tarefa.id}`, {
        method: 'PUT',
        body: JSON.stringify({ completo: !tarefa.completo }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao atualizar tarefa.');
      }

      setTarefas((atuais) =>
        atuais.map((item) => (item.id === dados.id ? dados : item))
      );
      setMensagem('');
    } catch (error) {
      setMensagem(error.message);
    }
  }

  async function removerTarefa(id) {
    try {
      const resposta = await requisicaoAutenticada(`/tarefas/${id}`, {
        method: 'DELETE',
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao excluir tarefa.');
      }

      setTarefas((atuais) => atuais.filter((tarefa) => tarefa.id !== id));
      setMensagem('');
    } catch (error) {
      setMensagem(error.message);
    }
  }

  if (!token || !usuario) {
    return (
      <main className="container">
        <div className="lista-container">
          <h1>{modo === 'cadastro' ? 'Criar conta' : 'Entrar'}</h1>

          <form className="formulario-login" onSubmit={autenticar}>
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Senha (mínimo 8 caracteres)"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'}
              minLength={modo === 'cadastro' ? 8 : undefined}
              required
            />

            <button type="submit">
              {modo === 'cadastro' ? 'Cadastrar' : 'Entrar'}
            </button>
            

            
          </form>

          <p>
            {modo === 'cadastro' ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setModo(modo === 'cadastro' ? 'login' : 'cadastro');
                setMensagem('');
              }}
            >
              {modo === 'cadastro' ? 'Fazer login' : 'Criar conta'}
            </button>
          </p>

          {mensagem && <p className="mensagem">{mensagem}</p>}
        </div>
      </main>
    );
  }

  

  return (
    <main className="container">
      <div className="lista-container">
        <h1>Lista de Tarefas</h1>
        <p>Conectado como {usuario.email}</p>
        <button type="button" onClick={encerrarSessao}>Sair</button>

        <button type="button" onClick={ativarLembretes}>
  {lembretesAtivos ? 'Lembretes ativados' : 'Ativar lembretes'}
</button>

        <form onSubmit={adicionarTarefa} className="formulario">
          <input
            type="text"
            placeholder="Digite uma nova tarefa..."
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            required
          />
          <button type="submit">Adicionar</button>
        </form>

        {mensagem && <p className="mensagem">{mensagem}</p>}

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
                  type="button"
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
