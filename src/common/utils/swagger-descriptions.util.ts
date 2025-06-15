import { TipoUsuario, RolUsuario } from '@prisma/client';

interface EndpointDescription {
  summary: string;
  description?: string;
  roles?: (TipoUsuario | RolUsuario)[];
  isPublic?: boolean;
}

/**
 * Genera una descripción mejorada para endpoints de la API
 * que incluye información sobre roles y permisos
 */
export function createApiOperation({
  summary,
  description,
  roles = [],
  isPublic = false,
}: EndpointDescription) {
  let fullDescription = summary;

  if (isPublic) {
    fullDescription += '\n\n🔓 **Acceso público** - No requiere autenticación';
  } else if (roles.length > 0) {
    const rolesFormatted = formatRoles(roles);
    fullDescription += `\n\n🔐 **Roles permitidos:** ${rolesFormatted}`;
  }

  if (description) {
    fullDescription += `\n\n${description}`;
  }

  return {
    summary,
    description: fullDescription,
  };
}

/**
 * Formatea la lista de roles para mostrar en la documentación
 */
function formatRoles(roles: (TipoUsuario | RolUsuario)[]): string {
  const roleDescriptions: Record<string, string> = {
    // Tipos de Usuario
    [TipoUsuario.ADMIN_SISTEMA]: 'Administrador del Sistema',
    [TipoUsuario.CLIENTE]: 'Cliente',
    [TipoUsuario.PERSONAL_COOPERATIVA]: 'Personal de Cooperativa',
    
    // Roles de Usuario
    [RolUsuario.ADMIN_COOPERATIVA]: 'Administrador de Cooperativa',
    [RolUsuario.OFICINISTA]: 'Oficinista',
    [RolUsuario.CONDUCTOR]: 'Conductor',
    [RolUsuario.AYUDANTE]: 'Ayudante',
  };

  return roles
    .map(role => roleDescriptions[role] || role)
    .join(', ');
}

/**
 * Descripciones específicas para diferentes tipos de endpoints comunes
 */
export const CommonDescriptions = {
  // CRUD Operations
  getAll: (resource: string, roles: (TipoUsuario | RolUsuario)[], additionalInfo?: string) =>
    createApiOperation({
      summary: `Obtener todos los ${resource}`,
      description: additionalInfo || `Lista paginada de todos los ${resource} disponibles`,
      roles,
    }),

  getById: (resource: string, roles: (TipoUsuario | RolUsuario)[], additionalInfo?: string) =>
    createApiOperation({
      summary: `Obtener ${resource} por ID`,
      description: additionalInfo || `Obtiene los detalles completos de un ${resource} específico`,
      roles,
    }),

  create: (resource: string, roles: (TipoUsuario | RolUsuario)[], additionalInfo?: string) =>
    createApiOperation({
      summary: `Crear nuevo ${resource}`,
      description: additionalInfo || `Crea un nuevo ${resource} en el sistema`,
      roles,
    }),

  update: (resource: string, roles: (TipoUsuario | RolUsuario)[], additionalInfo?: string) =>
    createApiOperation({
      summary: `Actualizar ${resource}`,
      description: additionalInfo || `Actualiza los datos de un ${resource} existente`,
      roles,
    }),

  delete: (resource: string, roles: (TipoUsuario | RolUsuario)[], additionalInfo?: string) =>
    createApiOperation({
      summary: `Eliminar ${resource}`,
      description: additionalInfo || `Elimina o desactiva un ${resource} del sistema`,
      roles,
    }),

  // Public endpoints
  getPublic: (resource: string, additionalInfo?: string) =>
    createApiOperation({
      summary: `Obtener ${resource} (Público)`,
      description: additionalInfo || `Endpoint público para consultar ${resource}`,
      isPublic: true,
    }),

  // State changes
  changeState: (resource: string, state: string, roles: (TipoUsuario | RolUsuario)[], additionalInfo?: string) =>
    createApiOperation({
      summary: `Cambiar estado de ${resource} a ${state}`,
      description: additionalInfo || `Cambia el estado del ${resource} a ${state}`,
      roles,
    }),
}; 