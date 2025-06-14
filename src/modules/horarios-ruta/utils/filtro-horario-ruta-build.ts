import { Prisma } from '@prisma/client';
import { FiltroHorarioRutaDto } from '../dto/filtro-horario-ruta.dto';

export const filtroHorarioRutaBuild = (
  filtro: FiltroHorarioRutaDto,
  tenantId?: number,
): Prisma.HorarioRutaWhereInput => {
  const where: Prisma.HorarioRutaWhereInput = {};

  if (tenantId) {
    where.ruta = {
      tenantId: tenantId,
    };
  }

  const { rutaId, horaSalida, activo } = filtro;

  if (rutaId !== undefined) {
    where.rutaId = rutaId;
  }

  if (horaSalida) {
    where.horaSalida = horaSalida;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
}; 