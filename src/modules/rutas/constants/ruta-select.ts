import { Prisma } from '@prisma/client';
import { RESOLUCION_ANT_SELECT } from 'src/modules/resoluciones-ant/constants/resolucion-ant-select';

export const RUTA_SELECT: Prisma.RutaSelect = {
  id: true,
  tenantId: true,
  nombre: true,
  resolucionId: true,
  descripcion: true,
  activo: true,
};

export const RUTA_SELECT_WITH_RELATIONS: Prisma.RutaSelect = {
  ...RUTA_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
    },
  },
  resolucion: {
    select: {
      ...RESOLUCION_ANT_SELECT,
    },
  },
};
