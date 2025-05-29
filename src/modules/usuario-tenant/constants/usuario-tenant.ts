import { Prisma } from '@prisma/client';
import { TENANT_SELECT } from 'src/modules/tenants/constants/tenant-select';

export const USUARIO_TENANT_SELECT: Prisma.UsuarioTenantSelect = {
  id: true,
  fechaAsignacion: true,
  tenantId: true,
  rol: true,
  tenant: {
    select: TENANT_SELECT,
  },
};

export const USUARIO_TENANT_SELECT_WITH_RELATIONS: Prisma.UsuarioTenantSelect =
  {
    ...USUARIO_TENANT_SELECT,
    usuario: {
      select: {
        id: true,
        username: true,
        tipoUsuario: true,
        fechaRegistro: true,
        ultimoAcceso: true,
      },
    },
  };
