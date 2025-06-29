# 🚀 Guía de Despliegue - EnRuta API

Esta guía te ayudará a desplegar la API de EnRuta usando Docker y CI/CD.

## 📋 Prerrequisitos

- Docker y Docker Compose instalados
- Git
- Acceso a un servidor (VPS, EC2, etc.)
- Base de datos PostgreSQL (local o en la nube)

## 🏗️ Estructura del Proyecto

```
en-ruta-api/
├── Dockerfile                 # Configuración de Docker
├── docker-compose.yml         # Servicios de desarrollo
├── docker-compose.prod.yml    # Servicios de producción
├── .github/workflows/         # CI/CD con GitHub Actions
├── scripts/deploy.sh          # Script de despliegue
├── nginx.conf                 # Configuración de Nginx
└── Makefile                   # Comandos útiles
```

## 🐳 Despliegue Local con Docker

### 1. Desarrollo Local

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd en-ruta-api

# Iniciar servicios de desarrollo
make compose-up

# Ver logs
make compose-logs

# Detener servicios
make compose-down
```

### 2. Construir Imagen Manualmente

```bash
# Construir imagen
make docker-build

# Ejecutar contenedor
make docker-run

# Ver logs
make logs

# Detener contenedor
make docker-stop
```

## 🚀 Despliegue en Producción

### Opción 1: Despliegue Manual

1. **Configurar variables de entorno** en tu servidor:

```bash
export DATABASE_URL="postgresql://usuario:password@host:puerto/database"
export DIRECT_URL="postgresql://usuario:password@host:puerto/database"
export JWT_SECRET="tu-secreto-jwt-super-seguro"
export JWT_EXPIRATION="360d"
export EMAIL_HOST="smtp.gmail.com"
export EMAIL_PORT="587"
export EMAIL_SECURE="false"
export EMAIL_USER="tu-email@gmail.com"
export EMAIL_PASSWORD="tu-password-de-app"
export EMAIL_FROM_NAME="EnRuta - Sistema de Transporte"
export EMAIL_FROM_ADDRESS="tu-email@gmail.com"
```

2. **Ejecutar script de despliegue**:

```bash
# Dar permisos de ejecución
chmod +x scripts/deploy.sh

# Ejecutar despliegue
./scripts/deploy.sh
```

### Opción 2: Docker Compose para Producción

```bash
# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Desplegar
make deploy-prod
```

## 🔄 CI/CD Automático con GitHub Actions

El proyecto incluye un pipeline de CI/CD que se ejecuta automáticamente:

### Triggers
- **Push a `main`**: Construye y despliega automáticamente
- **Pull Request**: Ejecuta tests
- **Push a `develop`**: Ejecuta tests

### Proceso Automático
1. **Tests**: Ejecuta tests unitarios y e2e
2. **Build**: Construye imagen Docker
3. **Push**: Sube imagen a GitHub Container Registry
4. **Release**: Crea release automático
5. **Deploy**: Despliega en producción (configurable)

### Configurar Despliegue Automático

1. **En tu servidor de producción**, crear un script de pull:

```bash
#!/bin/bash
# /opt/en-ruta/pull-and-deploy.sh

cd /opt/en-ruta
docker pull ghcr.io/tu-usuario/en-ruta-api:latest
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

2. **Configurar webhook** o usar GitHub Actions para ejecutar el script remotamente.

## 📊 Monitoreo y Logs

### Ver Logs
```bash
# Logs de Docker Compose
make compose-logs

# Logs de contenedor específico
make logs

# Logs de Nginx
docker logs en-ruta-nginx
```

### Health Checks
```bash
# Verificar estado de la API
curl http://localhost:3000/health

# Verificar estado de contenedores
make status
```

## 🔧 Comandos Útiles

```bash
# Ver todos los comandos disponibles
make help

# Ejecutar migraciones
make db-migrate

# Generar cliente Prisma
make db-generate

# Abrir Prisma Studio
make db-studio

# Backup de base de datos
make backup-db

# Shell en contenedor
make shell

# Reiniciar aplicación
make restart
```

## 🛠️ Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**:
   ```bash
   # Verificar variables de entorno
   echo $DATABASE_URL
   
   # Verificar conectividad
   docker exec en-ruta-postgres pg_isready -U postgres
   ```

2. **Error de permisos**:
   ```bash
   # Dar permisos al script
   chmod +x scripts/deploy.sh
   ```

3. **Puerto ocupado**:
   ```bash
   # Verificar puertos en uso
   netstat -tulpn | grep :3000
   
   # Cambiar puerto en docker-compose.yml
   ```

4. **Imagen no se construye**:
   ```bash
   # Limpiar cache de Docker
   docker system prune -a
   
   # Reconstruir sin cache
   docker build --no-cache -t en-ruta-api .
   ```

### Logs de Error

```bash
# Ver logs detallados
docker logs en-ruta-api-prod --tail 100

# Ver logs de Nginx
docker logs en-ruta-nginx --tail 50

# Ver logs de PostgreSQL
docker logs en-ruta-postgres --tail 50
```

## 🔒 Seguridad

### Variables de Entorno
- Nunca commits variables de entorno sensibles
- Usa secretos de GitHub para CI/CD
- Rota JWT_SECRET regularmente

### Firewall
```bash
# Abrir solo puertos necesarios
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### SSL/TLS
Para HTTPS, configura certificados SSL:

```bash
# Con Let's Encrypt
sudo certbot --nginx -d tu-dominio.com

# O con certificados propios
# Copiar certificados a ./ssl/
```

## 📈 Escalabilidad

### Horizontal Scaling
```bash
# Usar Docker Swarm o Kubernetes
docker swarm init
docker stack deploy -c docker-compose.prod.yml en-ruta
```

### Load Balancer
```bash
# Configurar múltiples instancias
# Modificar nginx.conf para balanceo de carga
upstream api_backend {
    server api1:3000;
    server api2:3000;
    server api3:3000;
}
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs y troubleshooting
2. Verificar configuración de variables de entorno
3. Consultar documentación de Docker y NestJS
4. Crear issue en el repositorio

---

**¡Tu API de EnRuta está lista para producción! 🎉** 