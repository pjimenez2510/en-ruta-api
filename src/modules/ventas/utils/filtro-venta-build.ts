import { Prisma } from '@prisma/client';
import { FiltroVentaDto } from '../dto/filtro-venta.dto';

export const filtroVentaBuild = (
  filtro: FiltroVentaDto,
  tenantId?: number,
): Prisma.VentaWhereInput => {
  const where: Prisma.VentaWhereInput = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const {
    viajeId,
    usuarioId,
    oficinistaId,
    metodoPagoId,
    estadoPago,
    fechaVenta,
    fechaVentaDesde,
    fechaVentaHasta,
    rutaId,
    nombreRuta,
    fechaViaje,
    fechaViajeDesde,
    fechaViajeHasta,
  } = filtro;

  if (viajeId !== undefined) {
    where.viajeId = viajeId;
  }

  if (usuarioId !== undefined) {
    where.usuarioId = usuarioId;
  }

  if (oficinistaId !== undefined) {
    where.oficinistaId = oficinistaId;
  }

  if (metodoPagoId !== undefined) {
    where.metodoPagoId = metodoPagoId;
  }

  if (estadoPago) {
    where.estadoPago = estadoPago;
  }

  // Filtros por fecha de venta
  if (fechaVenta) {
    where.fechaVenta = {
      gte: new Date(fechaVenta.setHours(0, 0, 0, 0)),
      lte: new Date(fechaVenta.setHours(23, 59, 59, 999)),
    };
  } else if (fechaVentaDesde || fechaVentaHasta) {
    where.fechaVenta = {};
    if (fechaVentaDesde) {
      where.fechaVenta.gte = new Date(fechaVentaDesde);
    }
    if (fechaVentaHasta) {
      where.fechaVenta.lte = new Date(fechaVentaHasta);
    }
  }

  // Filtros relacionados con viaje/ruta
  if (rutaId || nombreRuta || fechaViaje || fechaViajeDesde || fechaViajeHasta) {
    where.viaje = {};

    if (fechaViaje) {
      where.viaje.fecha = new Date(fechaViaje);
    } else if (fechaViajeDesde || fechaViajeHasta) {
      where.viaje.fecha = {};
      if (fechaViajeDesde) {
        where.viaje.fecha.gte = new Date(fechaViajeDesde);
      }
      if (fechaViajeHasta) {
        where.viaje.fecha.lte = new Date(fechaViajeHasta);
      }
    }

    if (rutaId || nombreRuta) {
      where.viaje.horarioRuta = {
        ruta: {},
      };

      if (rutaId) {
        where.viaje.horarioRuta.ruta.id = rutaId;
      }

      if (nombreRuta) {
        where.viaje.horarioRuta.ruta.nombre = {
          contains: nombreRuta,
          mode: 'insensitive',
        };
      }
    }
  }

  return where;
}; 