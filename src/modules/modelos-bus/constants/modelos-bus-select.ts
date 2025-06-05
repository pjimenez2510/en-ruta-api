import { Prisma } from '@prisma/client';

export const MODELO_BUS_SELECT: Prisma.ModeloBusSelect = {
  id: true,
  marca: true,
  modelo: true,
  tipoChasis: true,
  tipoCarroceria: true,
  anioModelo: true,
  numeroPisos: true,
  descripcion: true,
  esPublico: true,
};

export const MODELO_BUS_SELECT_WITH_RELATIONS: Prisma.ModeloBusSelect = {
  ...MODELO_BUS_SELECT,
  plantillasPiso: {
    select: {
      id: true,
      numeroPiso: true,
      filas: true,
      columnas: true,
      descripcion: true,
      esPublico: true,
    },
  },
};
