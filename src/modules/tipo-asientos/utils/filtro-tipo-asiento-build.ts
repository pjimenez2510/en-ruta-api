import { Prisma } from '@prisma/client';
import { FiltroTipoAsientoDto } from '../dto/filtro-tipo-asiento.dto';

export const filtroTipoAsientoBuild = (
  filtro: FiltroTipoAsientoDto,
): Prisma.TipoAsientoWhereInput => {
  const where: Prisma.TipoAsientoWhereInput = {};

  const { nombre, descripcion, color, icono, activo, tenantId } = filtro;

  if (nombre) {
    where.nombre = { contains: nombre, mode: 'insensitive' };
  }

  if (descripcion) {
    where.descripcion = { contains: descripcion, mode: 'insensitive' };
  }

  if (color) {
    where.color = { contains: color, mode: 'insensitive' };
  }

  if (icono) {
    where.icono = { contains: icono, mode: 'insensitive' };
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  if (tenantId !== undefined) {
    where.tenantId = tenantId;
  }

  return where;
};
