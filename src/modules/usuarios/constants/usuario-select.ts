import { Prisma } from '@prisma/client';
import { CLIENTE_SELECT } from 'src/modules/clientes/constants/clientes-select';
import { USUARIO_TENANT_SELECT } from 'src/modules/usuario-tenant/constants/usuario-tenant';

export const USUARIO_SELECT: Prisma.UsuarioSelect = {
  id: true,
  username: true,
  tipoUsuario: true,
  fechaRegistro: true,
  ultimoAcceso: true,
};

export const USUARIO_SELECT_WITH_RELATIONS: Prisma.UsuarioSelect = {
  ...USUARIO_SELECT,
  cliente: {
    select: CLIENTE_SELECT,
  },
  tenants: {
    select: USUARIO_TENANT_SELECT,
  },
};
