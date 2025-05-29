import { Prisma } from '@prisma/client';
import { TENANT_SELECT } from 'src/modules/tenants/constants/tenant-select';
import { USUARIO_SELECT } from 'src/modules/usuarios/constants/usuario-select';

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
      select: USUARIO_SELECT,
    },
  };
