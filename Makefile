# Fallbacks (caso o .env não esteja presente)
DB_NAME            ?= smastnx_desafio
DB_USER            ?= app_user
DB_PASS            ?= app_pass
MONGO_ROOT_USER    ?= root
MONGO_ROOT_PASS    ?= rootpass
MONGO_EXPRESS_PORT ?= 8081

# ==============================
# Config: nomes dos serviços
# ==============================
COMPOSE       := docker compose
ENVFILE_FLAG  := --env-file .env

API_DEV_SVC   := smartnx_api_dev
API_PROD_SVC  := smartnx_api_prod
DB_SVC        := smastnx_desafio_db
MONGO_SVC     := smastnx_desafio_mongo
MEXP_SVC      := smastnx_desafio_mongo_express

# ==============================
# Help (default)
# ==============================
.PHONY: help
help:
	@echo "Comandos úteis:"
	@echo "  make up-dev        - Sobe API (Dockerfile.dev) + DB + Mongo (profile dev)"
	@echo "  make up-prod       - Sobe API (Dockerfile) + DB + Mongo (profile prod)"
	@echo "  make down          - Para serviços (mantém volumes)"
	@echo "  make reset         - Para serviços e remove volumes (zera bancos)"
	@echo "  make clean         - down --volumes --remove-orphans (limpa tudo do compose)"
	@echo "  make prune         - docker system prune -a --volumes -f (CUIDADO: global)"
	@echo "  make ps            - Status dos serviços"
	@echo "  make cfg           - Mostra config/merge final do compose"
	@echo "  make cfg-dev       - Mostra config do profile dev"
	@echo "  make cfg-prod      - Mostra config do profile prod"
	@echo "  make logs          - Logs do Postgres"
	@echo "  make logs-api      - Logs da API dev"
	@echo "  make logs-api-prod - Logs da API prod"
	@echo "  make logs-mongo    - Logs do MongoDB"
	@echo "  make logs-mexp     - Logs do mongo-express"
	@echo "  make psql          - Abre psql no DB principal ($(DB_NAME))"
	@echo "  make psql-test     - Abre psql no DB de testes ($(DB_NAME)_test)"
	@echo "  make testdb        - Garante/cria DB de testes no Postgres (idempotente)"
	@echo "  make mongosh       - Abre mongosh como root"
	@echo "  make ui            - Abre UI do mongo-express (localhost:$(MONGO_EXPRESS_PORT))"

# ==============================
# Perfis dev/prod
# ==============================
.PHONY: up-dev up-prod
up-dev:
	$(COMPOSE) $(ENVFILE_FLAG) --profile dev up -d --build

up-prod:
	$(COMPOSE) $(ENVFILE_FLAG) --profile prod up -d --build

# ==============================
# Docker Compose básicos
# ==============================
.PHONY: down reset ps cfg cfg-dev cfg-prod clean prune nuke
down:
	$(COMPOSE) $(ENVFILE_FLAG) down

reset:
	$(COMPOSE) $(ENVFILE_FLAG) down -v

# Limpa todo o estado do compose (containers, volumes do projeto, órfãos)
clean:
	$(COMPOSE) $(ENVFILE_FLAG) down --volumes --remove-orphans

# Limpeza global do Docker (CUIDADO!)
prune:
	docker system prune -a --volumes -f

nuke:
	docker rm -f $$(docker ps -aq) || true
	docker volume rm $$(docker volume ls -q) || true
	docker network rm $$(docker network ls -q) || true

ps:
	$(COMPOSE) $(ENVFILE_FLAG) ps

cfg:
	$(COMPOSE) $(ENVFILE_FLAG) config

cfg-dev:
	$(COMPOSE) $(ENVFILE_FLAG) --profile dev config

cfg-prod:
	$(COMPOSE) $(ENVFILE_FLAG) --profile prod config

# ==============================
# Logs
# ==============================
.PHONY: logs logs-api logs-api-prod logs-mongo logs-mexp
logs:
	$(COMPOSE) $(ENVFILE_FLAG) logs -f $(DB_SVC)

logs-api:
	$(COMPOSE) $(ENVFILE_FLAG) logs -f $(API_DEV_SVC)

logs-api-prod:
	$(COMPOSE) $(ENVFILE_FLAG) logs -f $(API_PROD_SVC)

logs-mongo:
	$(COMPOSE) $(ENVFILE_FLAG) logs -f $(MONGO_SVC)

logs-mexp:
	$(COMPOSE) $(ENVFILE_FLAG) logs -f $(MEXP_SVC)

# ==============================
# Postgres: acesso rápido
# ==============================
.PHONY: psql psql-test testdb
psql:
	docker exec -it $(DB_SVC) psql -U $(DB_USER) -d $(DB_NAME)

psql-test:
	docker exec -it $(DB_SVC) psql -U $(DB_USER) -d $(DB_NAME)_test

# Garante/cria o DB de teste (idempotente)
testdb:
	docker exec -it $(DB_SVC) bash -lc "\
		PGPASSWORD=$(DB_PASS) psql -U $(DB_USER) -d postgres -tAc \
		\"SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)_test'\" | grep -q 1 || \
		PGPASSWORD=$(DB_PASS) psql -U $(DB_USER) -d postgres -c \
		\"CREATE DATABASE $(DB_NAME)_test OWNER $(DB_USER);\" \
	"

# ==============================
# Mongo: acesso rápido
# ==============================
.PHONY: mongosh ui
mongosh:
	docker exec -it $(MONGO_SVC) mongosh -u $(MONGO_ROOT_USER) -p $(MONGO_ROOT_PASS) --authenticationDatabase admin

ui:
	@echo "Abrindo http://localhost:$(MONGO_EXPRESS_PORT) ..."
	@if command -v open >/dev/null 2>&1; then open http://localhost:$(MONGO_EXPRESS_PORT); \
	elif command -v xdg-open >/dev/null 2>&1; then xdg-open http://localhost:$(MONGO_EXPRESS_PORT); \
	elif command -v start >/dev/null 2>&1; then start http://localhost:$(MONGO_EXPRESS_PORT); \
	else echo "Acesse manualmente: http://localhost:$(MONGO_EXPRESS_PORT)"; fi
