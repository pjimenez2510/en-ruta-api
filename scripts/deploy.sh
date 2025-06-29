#!/bin/bash

# Script de despliegue para EnRuta API
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
IMAGE_NAME="en-ruta-api"
CONTAINER_NAME="en-ruta-api-prod"
NETWORK_NAME="en-ruta-network"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

print_message "Iniciando despliegue de EnRuta API..."

# Crear red si no existe
if ! docker network ls | grep -q $NETWORK_NAME; then
    print_message "Creando red Docker: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi

# Detener y eliminar contenedor existente si existe
if docker ps -a | grep -q $CONTAINER_NAME; then
    print_message "Deteniendo contenedor existente: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Eliminar imagen anterior si existe
if docker images | grep -q $IMAGE_NAME; then
    print_message "Eliminando imagen anterior: $IMAGE_NAME"
    docker rmi $IMAGE_NAME
fi

# Construir nueva imagen
print_message "Construyendo nueva imagen Docker..."
docker build -t $IMAGE_NAME .

# Ejecutar migraciones de base de datos
print_message "Ejecutando migraciones de base de datos..."
docker run --rm \
    --network $NETWORK_NAME \
    -e DATABASE_URL="$DATABASE_URL" \
    -e DIRECT_URL="$DIRECT_URL" \
    $IMAGE_NAME \
    npx prisma migrate deploy

# Iniciar contenedor
print_message "Iniciando contenedor de producción..."
docker run -d \
    --name $CONTAINER_NAME \
    --network $NETWORK_NAME \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e DATABASE_URL="$DATABASE_URL" \
    -e DIRECT_URL="$DIRECT_URL" \
    -e JWT_SECRET="$JWT_SECRET" \
    -e JWT_EXPIRATION="$JWT_EXPIRATION" \
    -e EMAIL_HOST="$EMAIL_HOST" \
    -e EMAIL_PORT="$EMAIL_PORT" \
    -e EMAIL_SECURE="$EMAIL_SECURE" \
    -e EMAIL_USER="$EMAIL_USER" \
    -e EMAIL_PASSWORD="$EMAIL_PASSWORD" \
    -e EMAIL_FROM_NAME="$EMAIL_FROM_NAME" \
    -e EMAIL_FROM_ADDRESS="$EMAIL_FROM_ADDRESS" \
    --restart unless-stopped \
    $IMAGE_NAME

# Verificar que el contenedor esté ejecutándose
sleep 5
if docker ps | grep -q $CONTAINER_NAME; then
    print_message "✅ Contenedor iniciado exitosamente!"
    print_message "🌐 API disponible en: http://localhost:3000"
    print_message "📊 Logs del contenedor: docker logs $CONTAINER_NAME"
else
    print_error "❌ Error al iniciar el contenedor"
    docker logs $CONTAINER_NAME
    exit 1
fi

print_message "🎉 Despliegue completado exitosamente!" 