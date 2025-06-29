import { Prisma } from '@prisma/client';
import { PERSONAL_COOPERATIVA_SELECT } from 'src/modules/personal-cooperativa/constants/personal-cooperativa-select';
import { TENANT_SELECT } from 'src/modules/tenants/constants/tenant-select';

export const USUARIO_TENANT_SELECT: Prisma.UsuarioTenantSelect = {
  id: true,
  fechaAsignacion: true,
  tenantId: true,
  rol: true,
  activo: true,
  tenant: {
    select: TENANT_SELECT,
  },
  infoPersonal: {
    select: PERSONAL_COOPERATIVA_SELECT,
  },
};

export const USUARIO_TENANT_SELECT_WITH_RELATIONS: Prisma.UsuarioTenantSelect =
  {
    ...USUARIO_TENANT_SELECT,
    tenant: false,
    usuario: {
      select: {
        id: true,
        username: true,
        tipoUsuario: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        activo: true,
      },
    },
  };
