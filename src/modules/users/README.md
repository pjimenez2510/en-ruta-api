# Módulo de Usuarios - En Ruta API

Este módulo maneja la gestión de usuarios para la aplicación En Ruta, permitiendo registrar, autenticar y administrar usuarios con diferentes roles en el sistema.

## Estructura

El módulo está organizado de la siguiente manera:

- `users.controller.ts`: Endpoints de la API para operaciones CRUD de usuarios.
- `users.service.ts`: Lógica de negocio para gestionar usuarios.
- `dto/`: Objetos de transferencia de datos para validación de entradas.
- `entities/`: Entidades relacionadas con el modelo de usuario.

## Modelos de Datos

El módulo interactúa principalmente con los siguientes modelos en la base de datos:

- `Usuario`: Contiene información básica del usuario como email, contraseña, datos personales.
- `UsuarioTenant`: Relación muchos a muchos entre usuarios y cooperativas (tenants) con rol específico.

## Roles de Usuario

Los usuarios pueden tener diferentes roles en el sistema:

- `CLIENTE`: Usuario final que compra boletos.
- `ADMIN_SISTEMA`: Administrador global del sistema.
- `PERSONAL_COOPERATIVA`: Personal que trabaja para una cooperativa específica.

Además, dentro de cada cooperativa, un usuario puede tener los siguientes roles:

- `ADMIN_COOPERATIVA`: Administrador de una cooperativa específica.
- `OFICINISTA`: Personal que vende boletos en oficina.
- `CONDUCTOR`: Conductor de bus.
- `AYUDANTE`: Ayudante del conductor.

## Endpoints

### Gestión de Usuarios

- `POST /users`: Crear un nuevo usuario.
- `GET /users`: Obtener todos los usuarios (con filtros opcionales).
- `GET /users/:id`: Obtener un usuario por ID.
- `GET /users/email/:email`: Obtener un usuario por email.
- `PATCH /users/:id`: Actualizar un usuario.
- `DELETE /users/:id`: Eliminar un usuario (marcar como inactivo).

### Gestión de Relaciones Usuario-Tenant

- `POST /users/:id/tenants`: Asignar un usuario a un tenant con un rol específico.
- `DELETE /users/:id/tenants/:tenantId/roles/:rol`: Eliminar asignación de un usuario a un tenant.

## Casos de Uso

1. **Registro de Usuario**: Un cliente se registra en la plataforma para poder comprar boletos.
2. **Asignación de Personal**: Un administrador asigna roles a los empleados de una cooperativa.
3. **Actualización de Perfil**: Un usuario actualiza su información personal.
4. **Cambio de Contraseña**: Un usuario cambia su contraseña.

## Integración con el Sistema de Autenticación

El módulo de usuarios es la base para el sistema de autenticación y autorización, proporcionando funcionalidades para:

- Verificación de credenciales
- Almacenamiento seguro de contraseñas (hash)
- Gestión de permisos basados en roles

## Consideraciones de Seguridad

- Las contraseñas se almacenan con hash usando bcrypt.
- Se verifica la unicidad de email y cédula.
- Se implementan validaciones en los DTOs para garantizar la integridad de los datos.
- Los usuarios inactivos no pueden iniciar sesión.

## Dependencias

- Prisma ORM para interactuar con la base de datos.
- bcrypt para hashear contraseñas.
- class-validator para validación de DTOs.
- NestJS para la arquitectura del módulo.

## Ejemplo de Uso

```typescript
// Crear un nuevo usuario
const newUser = await usersService.create({
  email: 'usuario@example.com',
  password: 'contraseña123',
  nombres: 'Juan',
  apellidos: 'Pérez',
  cedula: '1234567890',
  tipoUsuario: TipoUsuario.CLIENTE
});

// Asignar un usuario a una cooperativa como oficinista
await usersService.assignToTenant(userId, {
  tenantId: cooperativaId,
  rol: RolUsuario.OFICINISTA
});
```