import { Prisma } from '@prisma/client';

export const ASIENTO_SELECT: Prisma.AsientoSelect = {
  id: true,
  pisoBusId: true,
  numero: true,
  fila: true,
  columna: true,
  tipoId: true,
  estado: true,
  notas: true,
  tipo: {
    select: {
      id: true,
      nombre: true,
      factorPrecio: true,
      color: true,
    },
  },
};
