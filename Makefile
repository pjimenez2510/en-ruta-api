.PHONY: prepare environments

DEV_TAG := dev

up-dev:
	@echo "Starting development environment"
	docker compose up -d --build my-service-dev
	@echo "Development environment started"

down-dev:
	@echo "Stopping development environment"
	docker compose rm -s -v my-service-dev db-dev
	@echo "Development environment stopped"

connect-db-dev:
	@echo "Connecting to development database"
	docker exec -it db-dev psql -U postgres development_db
	@echo "Connected to development database"

i-dep:
	@echo "Installing dependencies"
	docker exec -it livestock-manager-api yarn install
	@echo "Dependencies installed"