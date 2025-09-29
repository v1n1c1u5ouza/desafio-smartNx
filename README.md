# Desafio – Back-end (SmartNx)

---

## Status atual

* Auth (register/login) com JWT armazenado no MongoDB
* CRUD de Posts e Comentários no PostgreSQL, com JWT obrigatório em todas as rotas (GET/POST/PUT/DELETE)
* Token de login já retorna `Bearer <jwt>` e payload inclui `username`
* Banco PostgreSQL + MongoDB + Mongo Express via Docker Compose (config via `.env`)
* Makefile com atalhos (subir/parar/resetar, psql, mongosh, logs)
* Testes unitários (auth, posts, comments) e teste de integração para rotas protegidas
* ESLint configurado para Node + Jest

---

# Parte 1 – Explicação (por quê)

### Arquitetura (MVC)

O projeto segue o padrão **Model-View-Controller**:

* **Models**: representam as entidades da aplicação e se comunicam diretamente com os bancos de dados
  (MongoDB para usuários e PostgreSQL para posts/comentários).
* **Controllers**: centralizam a lógica de negócio e tratam requisições/respostas HTTP.
* **Routes**: organizam os endpoints e redirecionam para os controllers.

**Por que MVC?**

* Separar responsabilidades e manter o código organizado.
* Facilitar manutenção e escalabilidade.
* Isolar regras de negócio da lógica de acesso a dados.

---

### Por que essas bibliotecas?

* **express** → framework minimalista para rotas e middlewares de API.
* **sequelize + pg/pg-hstore** → ORM para mapear entidades no PostgreSQL (Posts/Comments).
* **mongoose** → ODM para persistir usuários no MongoDB.
* **jsonwebtoken** → geração/validação de tokens JWT (segurança).
* **bcrypt** → hashing de senhas (não armazenar texto plano).
* **dotenv** → carregamento seguro de variáveis de ambiente.

---

### Variáveis de ambiente

As variáveis no `.env` permitem configurar a aplicação sem alterar o código.

* **JWT_SECRET** → chave usada para assinar/verificar tokens JWT.
* **DB_HOST, DB_USER, DB_PASS, DB_NAME** → conexão com PostgreSQL.
* **MONGO_URI, MONGO_DB, MONGO_ROOT_USER, MONGO_ROOT_PASS** → conexão/autenticação MongoDB.
* **PORT** → porta da API.

Isso permite rodar em **dev** e **prod** sem mudar código-fonte, apenas alterando o `.env`.

---

### Dockerização

O repositório contém um `docker-compose.yml` que provisiona toda a infraestrutura:

* **PostgreSQL** → persistência de Posts e Comentários.
* **MongoDB** → persistência de Usuários.
* **Mongo Express** → interface web para o Mongo.
* **API** → aplicação Node.js com perfis:

  * **Dev** → `docker compose --profile dev up -d` (nodemon, hot-reload).
  * **Prod** → `docker compose --profile prod up -d` (somente deps de produção).

---

### Endpoints – funcionamento

**Autenticação (MongoDB)**

* `POST /register` → cria usuário com senha hasheada.
* `POST /login` → autentica credenciais e retorna JWT (Bearer).
* JWT é obrigatório em todas as rotas de posts/comments.

**Posts (PostgreSQL)**

* `POST /posts` → cria post vinculado ao `authorId` e `authorUsername`.
* `GET /posts` → lista todos os posts.
* `GET /posts/:id` → retorna post específico.
* `PUT /posts/:id` → atualiza post (somente autor pode editar).
* `DELETE /posts/:id` → deleta post (somente autor). Comentários ligados ao post são removidos em cascade.

**Comments (PostgreSQL)**

* `POST /posts/:postId/comments` → adiciona comentário a um post.
* `PUT /posts/:postId/comments/:commentId` → edita comentário (somente autor).
* `DELETE /posts/:postId/comments/:commentId` → remove comentário (somente autor).
* Erros:

  * `404` → recurso não encontrado
  * `403` → não é o autor
  * `400` → nada para atualizar

---

# Parte 2 – Guia prático (como usar)

### Requisitos

* Node.js 22+
* Docker + Docker Compose
* (Opcional) Make (para atalhos como `make up`, `make down`)

Dependências principais: `bcrypt`, `dotenv`, `express`, `jsonwebtoken`, `mongoose`, `pg`, `pg-hstore`, `sequelize`
Dependências de dev: `jest`, `babel-jest`, `eslint`, `nodemon`, etc.

---

### Variáveis de ambiente

Crie `.env` com:

```env
# App
PORT=3000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES=1h

# Postgres
DB_HOST=db
DB_PORT=5433
DB_NAME=your_postgres_db_name
DB_USER=your_postgres_user
DB_PASS=your_postgres_password

# Mongo
MONGO_URI=mongodb://your_mongo_user:your_mongo_pass@localhost:27017/?authSource=admin
MONGO_DB=your_mongo_db_name

# Compose root user/pass
MONGO_ROOT_USER=your_mongo_user
MONGO_ROOT_PASS=your_mongo_pass

# Ports
MONGO_PORT=27017
MONGO_EXPRESS_PORT=8081
```

---

### Subir infraestrutura

```bash
docker compose --profile dev up -d   # ambiente dev
docker compose --profile prod up -d  # ambiente prod
```

Com Makefile:

```bash
make up
make ps
make logs
make psql
make mongosh
```

---

### Rodar a API

```bash
npm install
npm run dev
```

Health check:

```http
GET http://localhost:3000/health
```

---

## Autenticação (MongoDB)

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

## CRUD de Posts (PostgreSQL)

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

## Comentários (PostgreSQL)

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

### Testes

Rodar:

```bash
npm test
```

Cobertura:

```bash
npm run test:cov
```

* Unitários → mock dos models.
* Integração → valida rotas protegidas.

---
