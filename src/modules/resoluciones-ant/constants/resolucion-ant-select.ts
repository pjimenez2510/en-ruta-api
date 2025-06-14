import { Prisma } from '@prisma/client';

export const RESOLUCION_ANT_SELECT: Prisma.ResolucionANTSelect = {
  id: true,
  numeroResolucion: true,
  fechaEmision: true,
  fechaVigencia: true,
  documentoUrl: true,
  descripcion: true,
  activo: true,
};

export const RESOLUCION_ANT_SELECT_WITH_RELATIONS: Prisma.ResolucionANTSelect = {
  ...RESOLUCION_ANT_SELECT,
  rutas: {
    select: {
      id: true,
      nombre: true,
      activo: true,
    },
  },
}; 