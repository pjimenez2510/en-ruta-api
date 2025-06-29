import { Prisma } from '@prisma/client';

export const TIPO_RUTA_BUS_SELECT: Prisma.TipoRutaBusSelect = {
  id: true,
  tenantId: true,
  nombre: true,
};

export const TIPO_RUTA_BUS_SELECT_WITH_RELATIONS: Prisma.TipoRutaBusSelect = {
  ...TIPO_RUTA_BUS_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
    },
  },
}; 