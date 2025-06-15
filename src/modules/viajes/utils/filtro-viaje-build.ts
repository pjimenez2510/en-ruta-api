import { Prisma } from '@prisma/client';
import { FiltroViajeDto } from '../dto/filtro-viaje.dto';
import { FiltroViajePublicoDto } from '../dto/filtro-viaje-publico.dto';

export const filtroViajeBuild = (
  filtro: FiltroViajeDto,
  tenantId?: number,
): Prisma.ViajeWhereInput => {
  const where: Prisma.ViajeWhereInput = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const {
    rutaId,
    horarioRutaId,
    busId,
    conductorId,
    ayudanteId,
    fecha,
    fechaDesde,
    fechaHasta,
    estado,
    generacion,
  } = filtro;

  if (rutaId !== undefined) {
    where.horarioRuta = {
      rutaId,
    };
  }

  if (horarioRutaId !== undefined) {
    where.horarioRutaId = horarioRutaId;
  }

  if (busId !== undefined) {
    where.busId = busId;
  }

  if (conductorId !== undefined) {
    where.conductorId = conductorId;
  }

  if (ayudanteId !== undefined) {
    where.ayudanteId = ayudanteId;
  }

  if (fecha) {
    where.fecha = new Date(fecha);
  } else if (fechaDesde || fechaHasta) {
    where.fecha = {};
    if (fechaDesde) {
      where.fecha.gte = new Date(fechaDesde);
    }
    if (fechaHasta) {
      where.fecha.lte = new Date(fechaHasta);
    }
  }

  if (estado) {
    where.estado = estado;
  }

  if (generacion) {
    where.generacion = generacion;
  }

  return where;
};

