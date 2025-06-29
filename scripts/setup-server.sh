#!/bin/bash

# Script para preparar el servidor de producción
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_message "🚀 Preparando servidor de producción para EnRuta API..."

# Actualizar sistema
print_message "Actualizando sistema..."
apt update && apt upgrade -y

# Instalar Docker
print_message "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
else
    print_message "Docker ya está instalado"
fi

# Instalar Docker Compose
print_message "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    print_message "Docker Compose ya está instalado"
fi

# Instalar curl para health checks
print_message "Instalando curl..."
apt install -y curl

# Crear directorio de la aplicación
print_message "Creando directorio de la aplicación..."
mkdir -p /opt/en-ruta
cd /opt/en-ruta

# Crear archivo de configuración de entorno
print_message "Creando archivo de configuración..."
cat > .env << 'EOF'
# Configuración de la aplicación
NODE_ENV=production
PORT=3000

# Configuración de base de datos (configurar según tu base de datos)
DATABASE_URL="postgresql://usuario:password@host:puerto/database?schema=public"
DIRECT_URL="postgresql://usuario:password@host:puerto/database?schema=public"

# Configuración de JWT
JWT_SECRET="cambiar-por-un-secreto-super-seguro"
JWT_EXPIRATION="360d"

# Configuración de email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-password-de-app"
EMAIL_FROM_NAME="EnRuta - Sistema de Transporte"
EMAIL_FROM_ADDRESS="tu-email@gmail.com"
EOF

# Crear docker-compose.prod.yml básico
print_message "Creando docker-compose.prod.yml..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  api:
    image: ghcr.io/tu-usuario/en-ruta-api:latest
    container_name: en-ruta-api-prod
    env_file:
      - .env
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  default:
    driver: bridge
EOF

# Configurar firewall
print_message "Configurando firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # API
ufw --force enable

# Crear script de despliegue manual
print_message "Creando script de despliegue manual..."
cat > deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Desplegando EnRuta API..."

# Detener contenedores existentes
docker-compose -f docker-compose.prod.yml down || true

# Eliminar imagen anterior
docker rmi ghcr.io/tu-usuario/en-ruta-api:latest || true

# Descargar nueva imagen
docker pull ghcr.io/tu-usuario/en-ruta-api:latest

# Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# Verificar estado
sleep 10
docker ps | grep en-ruta-api-prod

echo "✅ Despliegue completado!"
echo "🌐 API disponible en: http://$(curl -s ifconfig.me):3000"
EOF

chmod +x deploy.sh

# Crear script de logs
print_message "Creando script de logs..."
cat > logs.sh << 'EOF'
#!/bin/bash
docker logs -f en-ruta-api-prod
EOF

chmod +x logs.sh

# Crear script de backup
print_message "Creando script de backup..."
cat > backup.sh << 'EOF'
#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
echo "Creando backup: backup_$timestamp.sql"
# Aquí puedes agregar comandos de backup de base de datos
echo "Backup completado: backup_$timestamp.sql"
EOF

chmod +x backup.sh

# Configurar logrotate
print_message "Configurando logrotate..."
cat > /etc/logrotate.d/en-ruta << 'EOF'
/opt/en-ruta/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

print_message "✅ Servidor preparado exitosamente!"
print_message ""
print_message "📋 Próximos pasos:"
print_message "1. Editar /opt/en-ruta/.env con tus variables de entorno"
print_message "2. Editar /opt/en-ruta/docker-compose.prod.yml con tu usuario de GitHub"
print_message "3. Configurar secrets en GitHub Actions"
print_message "4. Hacer push a main para desplegar automáticamente"
print_message ""
print_message "🔧 Comandos útiles:"
print_message "cd /opt/en-ruta"
print_message "./deploy.sh    # Despliegue manual"
print_message "./logs.sh      # Ver logs"
print_message "./backup.sh    # Crear backup"
print_message ""
print_message "🌐 La API estará disponible en: http://$(curl -s ifconfig.me):3000" 