import { Prisma } from '@prisma/client';
import { CONFIGURACIONES_TENANT_SELECT } from 'src/modules/configuraciones-tenant/constants/configuraciones-tenant-select';

export const TENANT_SELECT: Prisma.TenantSelect = {
  id: true,
  nombre: true,
  identificador: true,
  logoUrl: true,
  colorPrimario: true,
  colorSecundario: true,
  sitioWeb: true,
  emailContacto: true,
  telefono: true,
};

export const TENANT_SELECT_WITH_RELATIONS: Prisma.TenantSelect = {
  ...TENANT_SELECT,
  configuraciones: {
    select: CONFIGURACIONES_TENANT_SELECT,
  },
};
