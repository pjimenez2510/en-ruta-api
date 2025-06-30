# Etapa de construcción
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo dev dependencies para build)
RUN npm ci && npm cache clean --force

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Dar permisos completos al directorio /app al usuario nestjs
RUN chown -R nestjs:nodejs /app

# Cambiar al usuario no-root ANTES de cualquier instalación
USER nestjs

# Copiar archivos de configuración
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs prisma ./prisma/

# Instalar solo dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Generar cliente de Prisma como el usuario correcto
RUN npx prisma generate

# Copiar el build desde la etapa anterior
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Comando de inicio con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/src/main"]