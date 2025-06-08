import { Prisma } from '@prisma/client';
import { FiltroUbicacionAsientoPlantillaDto } from '../dto/filtro-ubicacion-asiento-plantilla.dto';

export const filtroUbicacionAsientoPlantillaBuild = (
  filtro: FiltroUbicacionAsientoPlantillaDto,
): Prisma.UbicacionAsientoPlantillaWhereInput => {
  const where: Prisma.UbicacionAsientoPlantillaWhereInput = {};

  const { plantillaPisoId, fila, columna, estaHabilitado } = filtro;

  if (plantillaPisoId !== undefined) {
    where.plantillaPisoId = plantillaPisoId;
  }

  if (fila !== undefined) {
    where.fila = fila;
  }

  if (columna !== undefined) {
    where.columna = columna;
  }

  if (estaHabilitado !== undefined) {
    where.estaHabilitado = estaHabilitado;
  }

  return where;
};
