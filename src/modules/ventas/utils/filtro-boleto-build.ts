import { Prisma } from '@prisma/client';
import { FiltroBoletoDto } from '../dto/filtro-boleto.dto';

export const filtroBoletoBuilder = (
  filtro: FiltroBoletoDto,
  tenantId?: number,
): Prisma.BoletoWhereInput => {
  const where: Prisma.BoletoWhereInput = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const {
    ventaId,
    viajeId,
    clienteId,
    asientoId,
    estado,
    tipoDescuento,
    fechaViaje,
    fechaViajeDesde,
    fechaViajeHasta,
    codigoAcceso,
    documentoCliente,
    nombreCliente,
    ciudadOrigenId,
    ciudadDestinoId,
  } = filtro;

  if (ventaId !== undefined) {
    where.ventaId = ventaId;
  }

  if (viajeId !== undefined) {
    where.viajeId = viajeId;
  }

  if (clienteId !== undefined) {
    where.clienteId = clienteId;
  }

  if (asientoId !== undefined) {
    where.asientoId = asientoId;
  }

  if (estado) {
    where.estado = estado;
  }

  if (tipoDescuento) {
    where.tipoDescuento = tipoDescuento;
  }

  if (codigoAcceso) {
    where.codigoAcceso = {
      contains: codigoAcceso,
      mode: 'insensitive',
    };
  }

  // Filtros por fecha de viaje
  if (fechaViaje) {
    where.fechaViaje = new Date(fechaViaje);
  } else if (fechaViajeDesde || fechaViajeHasta) {
    where.fechaViaje = {};
    if (fechaViajeDesde) {
      where.fechaViaje.gte = new Date(fechaViajeDesde);
    }
    if (fechaViajeHasta) {
      where.fechaViaje.lte = new Date(fechaViajeHasta);
    }
  }

  // Filtros relacionados con cliente
  if (documentoCliente || nombreCliente) {
    where.cliente = {};

    if (documentoCliente) {
      where.cliente.numeroDocumento = {
        contains: documentoCliente,
        mode: 'insensitive',
      };
    }

    if (nombreCliente) {
      where.cliente.OR = [
        {
          nombres: {
            contains: nombreCliente,
            mode: 'insensitive',
          },
        },
        {
          apellidos: {
            contains: nombreCliente,
            mode: 'insensitive',
          },
        },
      ];
    }
  }

  // Filtros por ciudades de origen y destino
  if (ciudadOrigenId !== undefined) {
    where.paradaOrigen = {
      ciudadId: ciudadOrigenId,
    };
  }

  if (ciudadDestinoId !== undefined) {
    where.paradaDestino = {
      ciudadId: ciudadDestinoId,
    };
  }

  return where;
}; 