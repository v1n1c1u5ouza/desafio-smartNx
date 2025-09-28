Desafio – Back-end (SmartNx)

Infra mínima e API para autenticação register/login usando Node.js + Express + Sequelize + PostgreSQL.
Banco dockerizado para facilitar a execução por qualquer avaliador.

Status atual:

Auth (register/login) funcionando com JWT

Banco PostgreSQL via Docker (compose)

Testes unitários com Jest (sem dependência de DB)

ESLint configurado para Node + Jest

⚙️ Requisitos

Node.js 18+

Docker + Docker Compose

(Opcional) Make (para atalhos como make up, make down)

🧪 Variáveis de ambiente

Crie um arquivo .env na raiz (ou copie de .env.example):

🐳 Subir infraestrutura (Docker)

O repositório contém um docker-compose.yml com:

PostgreSQL (porta host: 5433)

Tarefa de init para criar o banco de teste smastnx_desafio_test

Com Docker Compose
docker compose up -d
docker compose ps

Com Makefile (atalhos)
make up       # sobe containers
make ps       # status
make logs     # logs do Postgres
make psql     # entra no psql do DB principal
make psql-test# entra no psql do DB de testes
make down     # para containers (mantém dados)
make reset    # para containers e apaga volume (zera DB)


Se você já possui Postgres local na 5432, o compose expõe o container na 5433, evitando conflito.

▶️ Rodando a API (dev)

Instale dependências e suba a API:

npm install
npm run dev


Health check:

GET http://localhost:3000/health

🔐 Endpoints de Autenticação
POST /register

Cria um usuário (nome, username, senha).
Retorna 201 com id, name, username.

Exemplo:

curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Vinicius","username":"vini","password":"123456"}'

POST /login

Autentica e retorna JWT.

Exemplo:

curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"vini","password":"123456"}'


Resposta (exemplo):

{
  "token": "<jwt>",
  "user": { "id": 1, "name": "Vinicius", "username": "vini" }
}

Rotas protegidas (exemplo de header)
Authorization: Bearer <token>

🧑‍🔧 Testes

Os testes são unitários (Jest) e não dependem do banco — os models são mockados.

Rodar testes:

npm test


Cobertura:

npm run test:cov


Tecnologias de teste: Jest + babel-jest (para suportar ESM)
Arquivos relevantes: jest.config.cjs, babel.config.cjs, src/tests/**
