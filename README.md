# En Ruta API

API desarrollada con NestJS y Prisma para el sistema de gestión de cooperativas de transporte "En Ruta".

## Descripción del Proyecto

Este proyecto es el backend de "En Ruta", una aplicación diseñada para modernizar y optimizar la gestión de cooperativas de transporte terrestre. Provee una API RESTful para manejar recursos como rutas, horarios, buses, asientos, ventas de boletos, clientes y más.

## Requisitos Previos

- **Node.js**: v20 o superior.
- **Docker** y **Docker Compose**: Para un entorno de desarrollo consistente.
- **NPM** o **Yarn**: Gestor de paquetes de Node.js.
- **Make**: (Opcional) Para ejecutar comandos de forma simplificada a través del `Makefile`.

## Estructura de Carpetas

El proyecto sigue una arquitectura modular estándar en NestJS.

```
en-ruta-api/
├── prisma/               # Esquema, migraciones y seeds de la base de datos.
│   ├── migrations/
│   └── schema.prisma
├── src/                  # Código fuente de la aplicación.
│   ├── common/           # Módulos y utilidades compartidas (guards, filters, etc.).
│   ├── modules/          # Módulos de la aplicación (un módulo por cada entidad de negocio).
│   └── main.ts           # Punto de entrada de la aplicación.
├── test/                 # Pruebas end-to-end (e2e).
├── .env.template         # Plantilla de variables de entorno.
├── docker-compose.yml    # Orquestación de contenedores para desarrollo y producción.
├── Dockerfile            # Definición del contenedor de la aplicación.
├── Makefile              # Comandos para simplificar tareas comunes.
└── package.json          # Dependencias y scripts del proyecto.
```

## Instalación y Configuración

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd en-ruta-api
    ```

2.  **Configurar variables de entorno:**
    Copia el archivo de plantilla `.env.template` y renómbralo a `.env`. Ajusta las variables según tu entorno local.

    ```bash
    cp .env.template .env
    ```

3.  **Instalar dependencias:**
    Se recomienda usar el `Makefile` para instalar las dependencias dentro del contenedor de Docker.
    ```bash
    make i-dep
    ```
    Si no usas Make, puedes hacerlo directamente con Docker:
    ```bash
    docker exec -it en-ruta-api-dev npm install
    ```

## Base de Datos

La gestión de la base de datos se realiza con Prisma.

### Migraciones

Para aplicar las migraciones y mantener el esquema de la base de datos actualizado:

```bash
# Ejecutar migraciones en el entorno de desarrollo
npx prisma migrate dev

# Crear una nueva migración después de modificar prisma.schema
npx prisma migrate dev --name "nombre-descriptivo-de-la-migracion"
```

_Nota: Estos comandos se deben ejecutar dentro del contenedor de la aplicación si se usa Docker._

### Seed (Poblar la base de datos)

Para poblar la base de datos con datos iniciales:

```bash
npm run prisma:seed
```

_Nota: Este comando se debe ejecutar dentro del contenedor de la aplicación si se usa Docker._

### Prisma Studio

Prisma Studio es una interfaz gráfica para visualizar y editar los datos de tu base de datos.

```bash
# Con Docker (recomendado)
docker exec -it en-ruta-api-dev npx prisma studio

# Sin Docker
npx prisma studio
```

Se abrirá en `http://localhost:5555`.

## Ejecución de la Aplicación

### Usando Makefile (Recomendado)

El `Makefile` simplifica la gestión del ciclo de vida de la aplicación con Docker.

```bash
# Iniciar el entorno de desarrollo (con hot-reload)
make up-dev

# Detener el entorno de desarrollo
make down-dev

# Ver logs de los servicios
make logs-dev

# Conectarse a la shell de la base de datos
make connect-db-dev
```

### Usando Docker Compose

Si no tienes `make`, puedes usar `docker-compose` directamente.

```bash
# Iniciar el entorno de desarrollo
docker-compose -f docker-compose.yml --profile dev up -d --build

# Detener el entorno de desarrollo
docker-compose -f docker-compose.yml --profile dev down
```

### Ejecución Local (sin Docker)

1.  Asegúrate de tener una instancia de PostgreSQL corriendo localmente.
2.  Configura la variable `DATABASE_URL` en tu archivo `.env`.
3.  Instala las dependencias: `npm install`.
4.  Ejecuta las migraciones: `npx prisma migrate dev`.
5.  Inicia la aplicación:
    ```bash
    npm run start:dev
    ```

## Ejecución de Pruebas

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas end-to-end (e2e)
npm run test:e2e

# Ver el cubrimiento de las pruebas
npm run test:cov
```

_Nota: Las pruebas se ejecutan contra la base de datos de pruebas definida en `docker-compose.yml`._

## Variables de Entorno

A continuación se describen las variables de entorno más importantes para la configuración del proyecto. Estas deben ser definidas en el archivo `.env`.

| Variable         | Descripción                                            | Ejemplo                               |
| :--------------- | :----------------------------------------------------- | :------------------------------------ |
| `DATABASE_URL`   | URL de conexión a la base de datos PostgreSQL.         | `postgresql://user:pass@host:port/db` |
| `PORT`           | Puerto en el que se expondrá la API.                   | `3000`                                |
| `JWT_SECRET`     | Clave secreta para firmar los tokens de autenticación. | `secreto-muy-seguro`                  |
| `JWT_EXPIRATION` | Tiempo de expiración para los tokens JWT.              | `1d`                                  |
| `EMAIL_HOST`     | Host del servidor de correo para envío de emails.      | `smtp.example.com`                    |
| `EMAIL_USER`     | Usuario para autenticarse en el servidor de correo.    | `user@example.com`                    |
| `EMAIL_PASSWORD` | Contraseña para el servidor de correo.                 | `password`                            |

## Autenticación y Autorización

La API utiliza JSON Web Tokens (JWT) para proteger los endpoints. Para acceder a las rutas protegidas, se debe incluir un token de portador (`Bearer Token`) en la cabecera `Authorization` de la solicitud.

El sistema también cuenta con un sistema de autorización basado en roles para controlar el acceso a ciertas operaciones.

## Despliegue

El despliegue de la aplicación está automatizado mediante GitHub Actions. Cada vez que se realiza un `push` a la rama `main`, se dispara un flujo de trabajo que despliega la última versión en el servidor de producción.

Para más detalles sobre la configuración del servidor y el proceso de despliegue, consulta el archivo [`DEPLOY.md`](./DEPLOY.md).

## Documentación de la API

La API está auto-documentada usando Swagger (OpenAPI). Una vez que la aplicación esté corriendo, puedes acceder a la documentación en:

- **`http://localhost:3000/api`**

Desde esta interfaz puedes ver todos los endpoints disponibles y probarlos directamente.

## Dependencias Clave

- **@nestjs/core**: El framework principal.
- **@prisma/client**: ORM para la interacción con la base de datos.
- **@nestjs/swagger**: Para la documentación de la API.
- **@nestjs/jwt** & **@nestjs/passport**: Para la autenticación con JWT.
- **class-validator** & **class-transformer**: Para la validación de DTOs.

## Comandos Útiles

| Comando                  | Descripción                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `make up-dev`            | Inicia el entorno de desarrollo con Docker.                          |
| `make down-dev`          | Detiene el entorno de desarrollo con Docker.                         |
| `make i-dep`             | Instala/actualiza las dependencias de npm.                           |
| `npm run start:dev`      | Inicia la aplicación en modo desarrollo con hot-reload (sin Docker). |
| `npm run prisma:seed`    | Puebla la base de datos con datos de prueba.                         |
| `npx prisma migrate dev` | Aplica migraciones a la base de datos de desarrollo.                 |
| `npx prisma studio`      | Abre la interfaz gráfica de Prisma.                                  |
| `npm run test`           | Ejecuta las pruebas unitarias.                                       |
| `npm run test:e2e`       | Ejecuta las pruebas end-to-end.                                      |
