import { Prisma } from '@prisma/client';

export const CIUDAD_SELECT: Prisma.CiudadSelect = {
  id: true,
  nombre: true,
  provincia: true,
  latitud: true,
  longitud: true,
  activo: true,
};

export const CIUDAD_SELECT_WITH_RELATIONS: Prisma.CiudadSelect = {
  ...CIUDAD_SELECT,
};
