# DTOs del Módulo de Email

Este directorio contiene todos los Data Transfer Objects (DTOs) utilizados en el módulo de emails.

## 📋 DTOs Disponibles

### 1. **email.dto.ts**
DTOs principales para el envío de emails:

- **SendEmailDto**: Para envío genérico de emails con plantillas
- **VentaEmailDto**: Para emails relacionados con ventas
- **BoletoEmailDto**: Para emails relacionados con boletos

### 2. **email-params.dto.ts**
DTOs para validación de parámetros de URL:

- **VentaIdParamDto**: Valida el parámetro `ventaId`
- **BoletoIdParamDto**: Valida el parámetro `boletoId`
- **BoletoEstadoParamDto**: Valida `boletoId` y `estado`
- **EmailTestDto**: Para el endpoint de prueba de emails
- **EstadisticasQueryDto**: Para consultas de estadísticas

### 3. **email-response.dto.ts**
DTOs para las respuestas de la API:

- **EmailResponseDto**: Respuesta estándar para operaciones de email
- **EstadisticasEmailDto**: Datos de estadísticas de emails
- **EstadisticasResponseDto**: Respuesta completa de estadísticas

## 🔧 Características de Validación

### Transformaciones Automáticas
- Los IDs se convierten automáticamente a números
- Los query parameters se transforman según su tipo

### Validaciones Implementadas
- **Emails**: Formato válido requerido
- **IDs**: Números enteros positivos
- **Strings**: No vacíos cuando son requeridos
- **Rangos**: Días entre 1 y 365 para estadísticas

### Mensajes de Error Personalizados
Todos los DTOs incluyen mensajes de error en español para mejor UX.

## 📚 Ejemplos de Uso

### Envío de Email Genérico
```typescript
const sendEmailDto: SendEmailDto = {
  to: 'cliente@example.com',
  subject: 'Confirmación de Compra',
  template: 'venta-confirmacion',
  context: {
    nombreCliente: 'Juan Pérez',
    numeroVenta: 123
  }
};
```

### Consulta de Estadísticas
```typescript
const query: EstadisticasQueryDto = {
  dias: 30 // Últimos 30 días
};
```

### Respuesta Estándar
```typescript
const response: EmailResponseDto = {
  success: true,
  message: 'Email enviado exitosamente'
};
```

## 🛡️ Seguridad y Validación

- **Whitelist**: Solo propiedades definidas en los DTOs son aceptadas
- **Transform**: Conversión automática de tipos
- **Sanitización**: Eliminación de propiedades no deseadas
- **Validación estricta**: Todos los campos requeridos deben estar presentes

## 🔄 Integración con Swagger

Todos los DTOs están completamente documentados con:
- Descripciones detalladas
- Ejemplos de uso
- Tipos de datos
- Validaciones aplicadas
- Respuestas esperadas

Esto genera automáticamente documentación interactiva en `/api`.

---

Los DTOs garantizan que todos los datos de entrada y salida del módulo de emails sean consistentes, válidos y bien documentados. 