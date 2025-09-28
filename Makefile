SERVICE=db
COMPOSE=docker compose

# Sobe DB cria DB principal e o de testes via init container
up:
	$(COMPOSE) up -d

# Para e remove containers mantém volume/dados
down:
	$(COMPOSE) down

# Para e remove zera o banco
reset:
	$(COMPOSE) down -v

# Status dos serviços
ps:
	$(COMPOSE) ps

# Logs do DB
logs:
	$(COMPOSE) logs -f $(SERVICE)

# psql dentro do container sem precisar do cliente no host
psql:
	docker exec -it smastnx_desafio_db psql -U app_user -d smastnx_desafio

# psql no DB de testes
psql-test:
	docker exec -it smastnx_desafio_db psql -U app_user -d smastnx_desafio_test

# Garante/cria o DB de teste (idempotente) via comando único
testdb:
	docker exec -it smastnx_desafio_db bash -lc "\
		PGPASSWORD=app_pass psql -U app_user -d postgres -tAc \
		\"SELECT 1 FROM pg_database WHERE datname = 'smastnx_desafio_test'\" | grep -q 1 || \
		PGPASSWORD=app_pass psql -U app_user -d postgres -c \
		\"CREATE DATABASE smastnx_desafio_test OWNER app_user;\" \
	"
