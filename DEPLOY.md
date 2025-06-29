# 🚀 Despliegue EnRuta API

## 📋 Configuración:

```
API (contenedor) ←→ PostgreSQL (contenedor) ←→ Volumen (datos persistentes)
```

## 🎯 **Solo 3 pasos:**

### **1. Preparar servidor (1 vez):**
```bash
ssh root@45.14.225.213
# Password: RdRq1q1900

# Solo instalar Docker:
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
```

### **2. Configurar GitHub Secrets:**
Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions**

Agregar estos secrets:
```
SERVER_HOST=45.14.225.213
SERVER_USER=root
SERVER_SSH_KEY=tu-clave-ssh-privada
JWT_SECRET=en-ruta-2024
JWT_EXPIRATION=360d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=pjimenez2510@gmail.com
EMAIL_PASSWORD=vbxj ddvn vnss qobl
EMAIL_FROM_NAME=EnRuta
EMAIL_FROM_ADDRESS=pjimenez2510@gmail.com
```

### **3. Hacer push:**
```bash
git add .
git commit -m "deploy"
git push origin main
```

## ✅ **Listo!**

- **API**: http://45.14.225.213:3000
- **Base de datos**: PostgreSQL en contenedor (puerto 5432)
- **Datos**: Persistentes en volumen Docker

## 🔧 **Comandos útiles:**

```bash
# Ver contenedores
docker ps

# Ver logs de la API
docker logs en-ruta-api

# Ver logs de la base de datos
docker logs en-ruta-db

# Conectar a PostgreSQL
docker exec -it en-ruta-db psql -U enruta -d enruta_db

# Reiniciar todo
docker restart en-ruta-api en-ruta-db
```

## 🗄️ **Configuración de Base de Datos:**

- **Base de datos**: `enruta_db`
- **Usuario**: `enruta`
- **Password**: `enruta123`
- **Puerto**: `5432`

## 🐳 **Desarrollo Local:**

```bash
# Iniciar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

---

**¡Todo en contenedores! 🐳** 