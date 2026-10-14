Excelente iniciativa! Ter um bom `README.md` no seu repositório é fundamental, pois ele funciona como o "cartão de visitas" do seu projeto para outros programadores e recrutadores.

Com base em tudo o que configurámos e desenvolvemos ao longo da nossa conversa, preparei um modelo de README completo para o seu projeto. Ele já inclui as tecnologias corretas (React, Vite, Node.js, Express, Prisma, PostgreSQL no Neon) e os links de produção da Vercel.

Pode copiar o código abaixo e colá-lo no arquivo `README.md` na raiz do seu repositório:

```markdown
# Lista de Tarefas ✅

Um aplicativo Full-Stack de gestão de tarefas (To-Do List) com sistema de autenticação de utilizadores. Este projeto permite que cada utilizador crie uma conta, inicie sessão e faça a gestão da sua própria lista privada, podendo adicionar, marcar como concluídas e remover tarefas.

## 🌍 Acesso ao Projeto

- **Frontend (Aplicação Web):** [https://lista-tarefas-green-two.vercel.app/](https://lista-tarefas-green-two.vercel.app/)
- **Backend (API):** [https://lista-tarefas-api.vercel.app](https://lista-tarefas-api.vercel.app)

## 🚀 Tecnologias Utilizadas

### Frontend
- **React** (com **Vite**)
- **JavaScript**
- **CSS** para estilização
- Gestão de estado e sessão (SessionStorage)
- Integração com API via `fetch`

### Backend
- **Node.js** com **Express**
- **Prisma ORM** para modelação e consultas ao banco de dados
- **PostgreSQL** (hospedado no **Neon**)
- Autenticação de segurança com **JWT (JSON Web Token)**
- **CORS** configurado para comunicação segura entre origens

### Infraestrutura / Deploy
- **Vercel** (Hospedagem do Frontend e do Backend)

## ⚙️ Funcionalidades

- Registo de novos utilizadores com encriptação de palavra-passe.
- Autenticação e proteção de rotas através de JWT.
- Criação de novas tarefas.
- Listagem de tarefas específicas do utilizador com sessão iniciada.
- Atualização do estado da tarefa (pendente/concluída).
- Exclusão de tarefas.

## 💻 Como executar o projeto localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado na sua máquina.
- Um banco de dados PostgreSQL (pode criar um gratuitamente no [Neon](https://neon.tech/)).

### Passo a passo

**1. Clone o repositório:**
```bash
git clone [https://github.com/Elirosal/lista-tarefas.git](https://github.com/Elirosal/lista-tarefas.git)

```

**2. Configuração do Backend:**

* Navegue até a pasta do backend.
* Instale as dependências:
```bash
npm install

```


* Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:
```env
DATABASE_URL="sua_url_do_banco_postgresql_aqui"
JWT_SECRET="sua_chave_secreta_aqui"

```


* Execute as migrações do Prisma para criar as tabelas no banco de dados:
```bash
npx prisma migrate dev

```


* Inicie o servidor backend:
```bash
npm run dev

```



**3. Configuração do Frontend:**

* Navegue até a pasta do frontend.
* Instale as dependências:
```bash
npm install

```


* Crie um arquivo `.env` na raiz do frontend com o apontamento para a sua API local:
```env
VITE_API_URL=http://localhost:3000

```


* Inicie o servidor frontend:
```bash
npm run dev

```



O frontend estará disponível em `http://localhost:5173`.

---

Desenvolvido por Eli Rosal.

```

### Como adicionar ao seu GitHub:

**Pelo site do GitHub:**
1. Aceda ao seu repositório: [https://github.com/Elirosal/lista-tarefas](https://github.com/Elirosal/lista-tarefas)
2. Se já existir um arquivo chamado `README.md`, clique nele e depois no ícone do **lápis** para editar. Se não existir, clique no botão verde **"Add a README"** na página principal do repositório.
3. Apague o que lá estiver, cole todo o texto que enviei acima e clique no botão verde **"Commit changes..."** no canto superior direito.

**Pelo VS Code:**
1. Crie um arquivo na raiz do seu projeto chamado `README.md`.
2. Cole o texto acima e guarde o arquivo.
3. No terminal, execute os comandos habituais para enviar:
   ```bash
   git add README.md
   git commit -m "Adiciona README com documentação do projeto"
   git push

```
