import { Prisma } from '@prisma/client';

export const TIPO_ASIENTO_SELECT: Prisma.TipoAsientoSelect = {
  id: true,
  nombre: true,
  descripcion: true,
  factorPrecio: true,
  color: true,
  icono: true,
  activo: true,
  tenantId: true,
};

export const TIPO_ASIENTO_SELECT_WITH_RELATIONS: Prisma.TipoAsientoSelect = {
  ...TIPO_ASIENTO_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
      identificador: true,
    },
  },
};
