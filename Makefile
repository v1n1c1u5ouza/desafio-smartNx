# ------------------------------
# Carrega o .env e exporta as variáveis
# ------------------------------
ifneq (,$(wildcard .env))
include .env
export
endif

# Fallbacks caso variáveis não estejam no .env
DB_NAME            ?= smastnx_desafio
DB_USER            ?= app_user
DB_PASS            ?= app_pass
MONGO_ROOT_USER    ?= root
MONGO_ROOT_PASS    ?= rootpass
MONGO_EXPRESS_PORT ?= 8081

# ------------------------------
# Config
# ------------------------------
COMPOSE   := docker compose
DB_SVC    := smastnx_desafio_db
MONGO_SVC := smastnx_desafio_mongo
MEXP_SVC  := smastnx_desafio_mongo_express

# ------------------------------
# Help (default)
# ------------------------------
.PHONY: help
help:
	@echo "Comandos úteis:"
	@echo "  make up           - Sobe todos os serviços (Postgres, init, Mongo, mongo-express)"
	@echo "  make down         - Para serviços (mantém volumes)"
	@echo "  make reset        - Para serviços e remove volumes (zera bancos)"
	@echo "  make ps           - Mostra status dos serviços"
	@echo "  make logs         - Logs do Postgres"
	@echo "  make logs-mongo   - Logs do MongoDB"
	@echo "  make logs-mexp    - Logs do mongo-express"
	@echo "  make psql         - Abre psql no DB principal ($(DB_NAME))"
	@echo "  make psql-test    - Abre psql no DB de testes ($(DB_NAME)_test)"
	@echo "  make testdb       - Garante/cria DB de testes no Postgres (idempotente)"
	@echo "  make mongosh      - Abre mongosh como root"
	@echo "  make ui           - Abre UI do mongo-express (localhost:$(MONGO_EXPRESS_PORT))"
	@echo "  make cfg          - Valida/mostra config efetiva do compose"

# ------------------------------
# Docker Compose
# ------------------------------
.PHONY: up down reset ps cfg
up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

reset:
	$(COMPOSE) down -v

ps:
	$(COMPOSE) ps

cfg:
	$(COMPOSE) config

# ------------------------------
# Logs
# ------------------------------
.PHONY: logs logs-mongo logs-mexp
logs:
	$(COMPOSE) logs -f $(DB_SVC)

logs-mongo:
	$(COMPOSE) logs -f $(MONGO_SVC)

logs-mexp:
	$(COMPOSE) logs -f $(MEXP_SVC)

# ------------------------------
# Postgres: acesso rápido
# ------------------------------
.PHONY: psql psql-test testdb
psql:
	docker exec -it $(DB_SVC) psql -U $(DB_USER) -d $(DB_NAME)

psql-test:
	docker exec -it $(DB_SVC) psql -U $(DB_USER) -d $(DB_NAME)_test

# Garante/cria o DB de teste 
testdb:
	docker exec -it $(DB_SVC) bash -lc "\
		PGPASSWORD=$(DB_PASS) psql -U $(DB_USER) -d postgres -tAc \
		\"SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)_test'\" | grep -q 1 || \
		PGPASSWORD=$(DB_PASS) psql -U $(DB_USER) -d postgres -c \
		\"CREATE DATABASE $(DB_NAME)_test OWNER $(DB_USER);\" \
	"

# ------------------------------
# Mongo: acesso rápido
# ------------------------------
.PHONY: mongosh ui
mongosh:
	docker exec -it $(MONGO_SVC) mongosh -u $(MONGO_ROOT_USER) -p $(MONGO_ROOT_PASS) --authenticationDatabase admin

ui:
	@echo "Abrindo http://localhost:$(MONGO_EXPRESS_PORT) ..."
	@if command -v open >/dev/null 2>&1; then open http://localhost:$(MONGO_EXPRESS_PORT); \
	elif command -v xdg-open >/dev/null 2>&1; then xdg-open http://localhost:$(MONGO_EXPRESS_PORT); \
	elif command -v start >/dev/null 2>&1; then start http://localhost:$(MONGO_EXPRESS_PORT); \
	else echo "Acesse manualmente: http://localhost:$(MONGO_EXPRESS_PORT)"; fi
