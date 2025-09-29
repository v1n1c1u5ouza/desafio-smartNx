# Desafio – Back-end (SmartNx)

---

## 🚀 Status atual

✅ Auth (register/login) com JWT armazenado no MongoDB
✅ CRUD de Posts e Comentários no PostgreSQL, com JWT obrigatório em todas as rotas (GET/POST/PUT/DELETE)
✅ Token de login já retorna `Bearer <jwt>` e payload inclui `username`
✅ Banco PostgreSQL + MongoDB + Mongo Express via Docker Compose (config via `.env`)
✅ Makefile com atalhos (subir/parar/resetar, psql, mongosh, logs)
✅ Testes unitários (auth, posts, comments) e teste de integração para rotas protegidas
✅ ESLint configurado para Node + Jest

---

## ⚙️ Requisitos

* Node.js 22+
* Docker + Docker Compose
* (Opcional) Make (para atalhos como `make up`, `make down`)

### Dependências principais
* bcrypt  
* dotenv  
* express  
* jsonwebtoken  
* mongoose  
* pg  
* pg-hstore  
* sequelize  

### Dependências de desenvolvimento
* @babel/core  
* @babel/preset-env  
* @eslint/js  
* @eslint/json  
* babel-jest  
* cross-env  
* eslint  
* globals  
* jest  
* nodemon

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

O repositório contém um `docker-compose.yml` que utiliza as variáveis do `.env` com:

* PostgreSQL: 
  * ports: `${DB_PORT}`
  * POSTGRES_USER: `${DB_USER}`
  * POSTGRES_PASSWORD: `${DB_PASS}`
  * POSTGRES_DB: `${DB_NAME}`
* MongoDB: 
  * ports: `${MONGO_PORT}`
  * MONGO_INITDB_ROOT_USERNAME:` ${MONGO_ROOT_USER}`
  * MONGO_INITDB_ROOT_PASSWORD: `${MONGO_ROOT_PASS}`
* Mongo Express 
  * posts: `${MONGO_EXPRESS_PORT}`
  * ME_CONFIG_MONGODB_ADMINUSERNAME: `${MONGO_ROOT_USER}`
  * ME_CONFIG_MONGODB_ADMINPASSWORD: `${MONGO_ROOT_PASS}`
  * ME_CONFIG_MONGODB_URL: mongodb://`${MONGO_ROOT_USER}`:`${MONGO_ROOT_PASS}`@mongo:27017/?authSource=admin

### Com Docker Compose

```bash
docker compose up -d
docker compose ps
```

### Com Makefile (atalhos)

```bash
  make up           - Sobe todos os serviços (Postgres, init, Mongo, mongo-express)
  make down         - Para serviços (mantém volumes)
  make reset        - Para serviços e remove volumes (zera bancos)
  make ps           - Mostra status dos serviços
  make logs         - Logs do Postgres
  make logs-mongo   - Logs do MongoDB
  make logs-mexp    - Logs do mongo-express
  make psql         - Abre psql no DB principal ($(DB_NAME))
  make psql-test    - Abre psql no DB de testes ($(DB_NAME)_test)
  make testdb       - Garante/cria DB de testes no Postgres (idempotente)
  make mongosh      - Abre mongosh como root
  make ui           - Abre UI do mongo-express (localhost:$(MONGO_EXPRESS_PORT))
  make cfg          - Valida/mostra config efetiva do compose
```

ℹ️ Se você já possui Postgres local na `5432`, o compose expõe o container na `${DB_PORT}` para evitar conflito.

---

## ▶️ Rodando a API (dev)

Instale dependências e suba a API:

```bash
npm install
npm run dev
```

## 🔐 Autenticação (MongoDB)

Todas as respostas e exemplos abaixo usam um usuário genérico (`usuario` / `user`). O token já vem prefixado com **Bearer**.

### POST `/register`

Cria um usuário (**name**, **username**, **password**).
Retorna **201** com `id`, `name`, `username`.

**cURL**

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"name":"usuario","username":"user","password":"123456"}'
```

**Postman/Insomnia**

* Método: `POST`
* URL: `http://localhost:3000/register`
* Body (JSON):

```json
{
  "name": "usuario",
  "username": "user",
  "password": "123456"
}
```

**Erros comuns**

* `400` → campos obrigatórios ausentes
* `409` → username já em uso

---

### POST `/login`

Autentica e retorna JWT com prefixo **Bearer**.

**cURL**

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"123456"}'
```

**Postman/Insomnia**

* Método: `POST`
* URL: `http://localhost:3000/login`
* Body → JSON:

```json
{
  "username": "user",
  "password": "123456"
}
```

**Resposta (exemplo)**

```json
{
  "token": "Bearer eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "68d9a96fe34e9ffa7626a6b6", "name": "usuario", "username": "user" }
}
```

**Como usar nas rotas protegidas**

Adicione o header exatamente como retornado:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📚 CRUD de Posts (PostgreSQL)

Todas as rotas abaixo exigem JWT. Cada post guarda `authorId` (id do Mongo) e `authorUsername`.

### POST `/posts`

Cria um post.

**cURL**

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Meu post","content":"Olá!"}'
```

**Postman/Insomnia**

* Método: `POST`
* URL: `http://localhost:3000/posts`
* Headers:

  * `Authorization`: `Bearer <seu_token>`
  * `Content-Type`: `application/json`
* Body → JSON:

```json
{
  "title": "Meu post",
  "content": "Olá!"
}
```

**Resposta 201 (exemplo)**

```json
{
  "id": 1,
  "title": "Meu post",
  "content": "Olá!",
  "authorId": "68d9a96fe34e9ffa7626a6b6",
  "authorUsername": "user",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### GET `/posts`

Lista posts.

**cURL**

```bash
curl -H "Authorization: Bearer <seu_token>" http://localhost:3000/posts
```

**Postman/Insomnia**

* Método: `GET`
* URL: `http://localhost:3000/posts`
* Headers:

  * `Authorization`: `Bearer <seu_token>`

---

### GET `/posts/:id`

Busca um post por id. `404` se não existir.

**cURL**

```bash
curl -H "Authorization: Bearer <seu_token>" \
  http://localhost:3000/posts/1
```

**Postman/Insomnia**

* Método: `GET`
* URL: `http://localhost:3000/posts/:id`
* Params: `id` (ex.: `1`)
* Headers:

  * `Authorization`: `Bearer <seu_token>`

---

### PUT `/posts/:id`

Atualiza `title` e/ou `content`. Somente o autor pode editar.

**cURL**

```bash
curl -X PUT http://localhost:3000/posts/1 \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Título editado"}'
```

**Postman/Insomnia**

* Método: `PUT`
* URL: `http://localhost:3000/posts/:id`
* Params: `id` (ex.: `1`)
* Headers:

  * `Authorization`: `Bearer <seu_token>`
  * `Content-Type`: `application/json`
* Body → JSON (exemplos):

```json
{ "title": "Título editado" }
```

**Erros**: `404` não encontrado, `403` não é o autor, `400` nada para atualizar.

---

### DELETE `/posts/:id`

Remove o post. Somente o autor pode deletar.

**cURL**

```bash
curl -X DELETE http://localhost:3000/posts/1 \
  -H "Authorization: Bearer <seu_token>"
```

**Postman/Insomnia**

* Método: `DELETE`
* URL: `http://localhost:3000/posts/:id`
* Params: `id` (ex.: `1`)
* Headers:

  * `Authorization`: `Bearer <seu_token>`

**Resposta**: `204` em sucesso, `404/403` em erro.

---

## 💬 Comentários (PostgreSQL)

Também exigem JWT e respeitam autoria.

### POST `/posts/:postId/comments`

Adiciona comentário a um post existente.

**cURL**

```bash
curl -X POST http://localhost:3000/posts/1/comments \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Muito bom!"}'
```

**Postman/Insomnia**

* Método: `POST`
* URL: `http://localhost:3000/posts/:postId/comments`
* Params: `postId` (ex.: `1`)
* Headers:

  * `Authorization`: `Bearer <seu_token>`
  * `Content-Type`: `application/json`
* Body → JSON:

```json
{ "content": "Muito bom!" }
```

Respostas: `201` sucesso, `404` post não encontrado.

---

### PUT `/posts/:postId/comments/:commentId`

Edita o comentário (somente autor).

**cURL**

```bash
curl -X PUT http://localhost:3000/posts/1/comments/10 \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Editado"}'
```

**Postman/Insomnia**

* Método: `PUT`
* URL: `http://localhost:3000/posts/:postId/comments/:commentId`
* Params: `postId` (ex.: `1`), `commentId` (ex.: `10`)
* Headers:

  * `Authorization`: `Bearer <seu_token>`
  * `Content-Type`: `application/json`
* Body → JSON:

```json
{ "content": "Editado" }
```

**Erros**: `404` não encontrado, `403` não é o autor, `400` nada para atualizar.

---

### DELETE `/posts/:postId/comments/:commentId`

Remove o comentário (somente autor).

**cURL**

```bash
curl -X DELETE http://localhost:3000/posts/1/comments/10 \
  -H "Authorization: Bearer <seu_token>"
```

**Postman/Insomnia**

* Método: `DELETE`
* URL: `http://localhost:3000/posts/:postId/comments/:commentId`
* Params: `postId` (ex.: `1`), `commentId` (ex.: `10`)
* Headers:

  * `Authorization`: `Bearer <seu_token>`

**Resposta**: `204` em sucesso.

---

## 🧑‍🔧 Testes

Os testes são:

* **Unitários** (Jest) → mock dos models, não dependem de banco real.
* **Integração** → valida rotas protegidas com JWT.

### Rodar testes

```bash
npm test
```

### Cobertura

```bash
npm run test:cov
```

**Tecnologias de teste**: Jest
**Arquivos relevantes**:

* `jest.config.cjs`
* `babel.config.cjs`
* `src/tests/**`
