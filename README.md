# Desafio – Back-end (SmartNx)

---

## 🚀 Status atual

* ✅ Auth (register/login) funcionando com JWT
* ✅ Banco PostgreSQL via Docker (compose)
* ✅ MongoDB via Docker (compose) para autenticação
* ✅ Testes unitários com Jest (sem dependência real de DB)
* ✅ ESLint configurado para Node + Jest

---

## ⚙️ Requisitos

* Node.js 18+
* Docker + Docker Compose
* (Opcional) Make (para atalhos como `make up`, `make down`)

---

## 🧪 Variáveis de ambiente

Crie um arquivo **`.env`** na raiz (ou copie de `.env.example`) e preencha:

```env
# App
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES=1h

# Postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=your_postgres_db_name
DB_USER=your_postgres_user
DB_PASS=your_postgres_password

# Mongo
MONGO_URI=mongodb://your_mongo_user:your_mongo_pass@localhost:27017/?authSource=admin
MONGO_DB=your_mongo_db_name

# Compose (Mongo root user)
MONGO_ROOT_USER=your_mongo_user
MONGO_ROOT_PASS=your_mongo_pass

# Ports
MONGO_PORT=27017
MONGO_EXPRESS_PORT=8081
```

---

## 🐳 Subir infraestrutura (Docker)

O repositório contém um `docker-compose.yml` com:

* PostgreSQL (porta host: 5433)
* MongoDB (porta host: 27017)
* Mongo Express (porta host: 8081)
* Init container para criar banco de teste `smastnx_desafio_test`

### Com Docker Compose

```bash
docker compose up -d
docker compose ps
```

### Com Makefile (atalhos)

```bash
make up        # sobe containers
make ps        # status
make logs      # logs do Postgres
make psql      # entra no psql do DB principal
make psql-test # entra no psql do DB de testes
make down      # para containers (mantém dados)
make reset     # para containers e apaga volume (zera DB)
```

ℹ️ Se você já possui Postgres local na `5432`, o compose expõe o container na `5433` para evitar conflito.

---

## ▶️ Rodando a API (dev)

Instale dependências e suba a API:

```bash
npm install
npm run dev
```

### Health check:

```http
GET http://localhost:3000/health
```

---

## 🔐 Endpoints de Autenticação

### POST `/register`

Cria um usuário (**name**, **username**, **password**).
Retorna **201** com id, name, username.

**Exemplo com curl:**

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"usuario","username":"user","password":"123456"}'
```

**Exemplo com Postman/Insomnia:**

* Método: `POST`
* URL: `http://localhost:3000/register`
* Body → JSON:

  ```json
  {
    "name": "usuario",
    "username": "user",
    "password": "123456"
  }
  ```

---

### POST `/login`

Autentica e retorna JWT.

**Exemplo com curl:**

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"123456"}'
```

**Exemplo com Postman/Insomnia:**

* Método: `POST`
* URL: `http://localhost:3000/login`
* Body → JSON:

  ```json
  {
    "username": "user",
    "password": "123456"
  }
  ```

**Resposta (exemplo):**

```json
{
  "token": "<jwt>",
  "user": { "id": "68d9a96fe34e9ffa7626a6b6", "name": "Vinicius", "username": "vini" }
}
```

---

### Rotas protegidas (exemplo de header)

```http
Authorization: Bearer <token>
```

---

## 🧑‍🔧 Testes

Os testes são unitários (Jest) e não dependem de banco real — os models são mockados.

Rodar testes:

```bash
npm test
```

Cobertura:

```bash
npm run test:cov
```

**Tecnologias de teste**: Jest
**Arquivos relevantes**:

* `jest.config.cjs`
* `babel.config.cjs`
* `src/tests/**`
