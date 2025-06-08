import { Prisma } from '@prisma/client';
import { FiltroAsientoDto } from '../dto/filtro-asiento.dto';

export const filtroAsientoBuild = (
  filtro: FiltroAsientoDto,
  tenantId?: number,
): Prisma.AsientoWhereInput => {
  const where: Prisma.AsientoWhereInput = {};

  const { busId, pisoBusId, numero, fila, columna, tipoId, estado } = filtro;

  // Filtrar por tenant y bus
  if (tenantId !== undefined || busId !== undefined) {
    where.pisoBus = {
      ...(busId !== undefined && { busId }),
      ...(tenantId !== undefined && { bus: { tenantId } }),
    };
  }

  if (pisoBusId !== undefined) {
    where.pisoBusId = pisoBusId;
  }

  if (numero !== undefined) {
    where.numero = numero;
  }

  if (fila !== undefined) {
    where.fila = fila;
  }

  if (columna !== undefined) {
    where.columna = columna;
  }

  if (tipoId !== undefined) {
    where.tipoId = tipoId;
  }

  if (estado !== undefined) {
    where.estado = estado;
  }

  return where;
};
