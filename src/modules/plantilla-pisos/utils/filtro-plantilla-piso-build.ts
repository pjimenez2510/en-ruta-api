import { Prisma } from '@prisma/client';
import { FiltroPlantillaPisoDto } from '../dto';

export const filtroPlantillaPisoBuild = (
  filtro: FiltroPlantillaPisoDto,
): Prisma.PlantillaPisoWhereInput => {
  const { modeloBusId, numeroPiso, descripcion, esPublico } = filtro;

  const where: Prisma.PlantillaPisoWhereInput = {};

  if (modeloBusId !== undefined) {
    where.modeloBusId = modeloBusId;
  }

  if (numeroPiso !== undefined) {
    where.numeroPiso = numeroPiso;
  }

  if (descripcion !== undefined) {
    where.descripcion = {
      contains: descripcion,
      mode: 'insensitive',
    };
  }

  if (esPublico !== undefined) {
    where.esPublico = esPublico;
  }

  return where;
};
