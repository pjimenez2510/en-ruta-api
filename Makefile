# Makefile para EnRuta API

.PHONY: help install build start dev test clean docker-build docker-run docker-stop docker-clean deploy

# Variables
DOCKER_IMAGE = en-ruta-api
DOCKER_CONTAINER = en-ruta-api-dev
DOCKER_COMPOSE_FILE = docker-compose.yml

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instalar dependencias
	npm install

build: ## Construir la aplicación
	npm run build

start: ## Iniciar la aplicación en producción
	npm run start:prod

dev: ## Iniciar la aplicación en modo desarrollo
	npm run start:dev

test: ## Ejecutar tests
	npm test

test:e2e: ## Ejecutar tests end-to-end
	npm run test:e2e

clean: ## Limpiar archivos generados
	rm -rf dist
	rm -rf node_modules
	rm -rf coverage

# Comandos de Docker
docker-build: ## Construir imagen Docker
	docker build -t $(DOCKER_IMAGE) .

docker-run: ## Ejecutar contenedor Docker
	docker run -d --name $(DOCKER_CONTAINER) -p 3000:3000 $(DOCKER_IMAGE)

docker-stop: ## Detener contenedor Docker
	docker stop $(DOCKER_CONTAINER)
	docker rm $(DOCKER_CONTAINER)

docker-clean: ## Limpiar imágenes y contenedores Docker
	docker stop $(DOCKER_CONTAINER) 2>/dev/null || true
	docker rm $(DOCKER_CONTAINER) 2>/dev/null || true
	docker rmi $(DOCKER_IMAGE) 2>/dev/null || true

# Comandos de Docker Compose
compose-up: ## Iniciar servicios con Docker Compose
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d

compose-down: ## Detener servicios con Docker Compose
	docker-compose -f $(DOCKER_COMPOSE_FILE) down

compose-logs: ## Ver logs de Docker Compose
	docker-compose -f $(DOCKER_COMPOSE_FILE) logs -f

compose-build: ## Construir imágenes con Docker Compose
	docker-compose -f $(DOCKER_COMPOSE_FILE) build

# Comandos de base de datos
db-migrate: ## Ejecutar migraciones de base de datos
	npx prisma migrate deploy

db-generate: ## Generar cliente de Prisma
	npx prisma generate

db-seed: ## Ejecutar seed de base de datos
	npx prisma db seed

db-studio: ## Abrir Prisma Studio
	npx prisma studio

# Comandos de despliegue
deploy: ## Desplegar aplicación (requiere variables de entorno)
	@if [ -z "$(DATABASE_URL)" ]; then \
		echo "Error: DATABASE_URL no está definida"; \
		exit 1; \
	fi
	chmod +x scripts/deploy.sh
	./scripts/deploy.sh

deploy-prod: ## Desplegar en producción con docker-compose
	docker-compose -f docker-compose.prod.yml up -d

# Comandos de desarrollo
lint: ## Ejecutar linter
	npm run lint

format: ## Formatear código
	npm run format

# Comandos de monitoreo
logs: ## Ver logs del contenedor
	docker logs -f $(DOCKER_CONTAINER)

status: ## Ver estado de los contenedores
	docker ps -a | grep $(DOCKER_CONTAINER) || echo "Contenedor no encontrado"

# Comandos de backup
backup-db: ## Crear backup de la base de datos
	@echo "Creando backup de la base de datos..."
	@timestamp=$$(date +%Y%m%d_%H%M%S); \
	docker exec en-ruta-postgres pg_dump -U postgres development_db > backup_$$timestamp.sql; \
	echo "Backup creado: backup_$$timestamp.sql"

# Comandos de utilidad
shell: ## Abrir shell en el contenedor
	docker exec -it $(DOCKER_CONTAINER) /bin/sh

restart: ## Reiniciar contenedor
	docker restart $(DOCKER_CONTAINER)

# Comando por defecto
.DEFAULT_GOAL := help