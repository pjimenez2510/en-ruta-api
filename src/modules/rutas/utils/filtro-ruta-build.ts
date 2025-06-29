import { Prisma } from '@prisma/client';
import { FiltroRutaDto } from '../dto/filtro-ruta.dto';

export const filtroRutaBuild = (
  filtro: FiltroRutaDto,
  tenantId?: number,
): Prisma.RutaWhereInput => {
  const where: Prisma.RutaWhereInput = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const { nombre, tipoRutaBusId, resolucionId, activo } = filtro;

  if (nombre) {
    where.nombre = { contains: nombre, mode: 'insensitive' };
  }

  if (tipoRutaBusId !== undefined) {
    where.tipoRutaBusId = tipoRutaBusId;
  }

  if (resolucionId !== undefined) {
    where.resolucionId = resolucionId;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
}; 