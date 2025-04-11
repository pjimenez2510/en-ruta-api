# En Ruta API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

API desarrollada con NestJS y Prisma para el proyecto En Ruta.

## Requisitos previos

- Node.js (v20 o superior)
- Docker y Docker Compose
- npm o yarn

## Configuración del entorno

1. Clona este repositorio.
2. Copia el archivo `.env.template` a `.env`:

```bash
cp .env.template .env
```

3. Ajusta las variables de entorno en el archivo `.env` según tu configuración local si es necesario.

## Iniciar el proyecto

### Con Makefile

Si tienes Make instalado, puedes usar los siguientes comandos para gestionar fácilmente el proyecto:

```bash
# Iniciar el entorno de desarrollo
make up-dev

# Detener el entorno de desarrollo
make down-dev

# Conectar a la base de datos de desarrollo
make connect-db-dev

# Instalar dependencias
make i-dep
```

### Sin Makefile

Si no tienes Make instalado, puedes usar directamente los comandos de Docker Compose:

```bash
# Iniciar el entorno de desarrollo
docker compose up -d --build my-service-dev

# Detener el entorno de desarrollo
docker compose rm -s -v my-service-dev db-dev

# Conectar a la base de datos de desarrollo
docker exec -it db-dev psql -U postgres development_db

# Instalar dependencias
docker exec -it en-ruta-api-dev yarn install
```

### Desarrollo local (sin Docker)

Si prefieres trabajar sin Docker, puedes configurar el proyecto localmente:

1. Instala las dependencias:

```bash
npm install
# o
yarn install
```

2. Asegúrate de tener una base de datos PostgreSQL corriendo y actualiza la variable `DATABASE_URL` en el archivo `.env`.

3. Ejecuta las migraciones de Prisma:

```bash
npx prisma migrate dev
```

4. Genera el cliente de Prisma:

```bash
npx prisma generate
```

5. Inicia la aplicación en modo desarrollo:

```bash
npm run start:dev
# o
yarn start:dev
```

## Estructura del proyecto

El proyecto sigue la estructura estándar de NestJS, con la adición de Prisma para la gestión de la base de datos:

- `src/`: Código fuente de la aplicación
- `prisma/`: Esquema y migraciones de Prisma
- `dist/`: Código compilado (generado al construir)

## Prisma Studio

Para explorar y modificar la base de datos usando Prisma Studio:

```bash
# Con Docker
docker exec -it en-ruta-api-dev npx prisma studio

# Sin Docker
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde podrás gestionar tus datos.

## Comandos útiles

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas e2e
npm run test:e2e

# Verificar cobertura de pruebas
npm run test:cov

# Generar nuevas migraciones tras cambios en el esquema de Prisma
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones en entorno de producción
npx prisma migrate deploy
```

## Documentación adicional

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de Prisma](https://www.prisma.io/docs)

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
