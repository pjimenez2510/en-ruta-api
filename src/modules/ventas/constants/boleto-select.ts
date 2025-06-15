import { Prisma } from '@prisma/client';

export const BOLETO_SELECT: Prisma.BoletoSelect = {
  id: true,
  tenantId: true,
  ventaId: true,
  viajeId: true,
  clienteId: true,
  asientoId: true,
  paradaOrigenId: true,
  paradaDestinoId: true,
  fechaViaje: true,
  horaSalida: true,
  precioBase: true,
  tipoDescuento: true,
  porcentajeDescuento: true,
  precioFinal: true,
  codigoAcceso: true,
  estado: true,
};

export const BOLETO_SELECT_WITH_RELATIONS: Prisma.BoletoSelect = {
  ...BOLETO_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
    },
  },
  venta: {
    select: {
      id: true,
      fechaVenta: true,
      totalFinal: true,
      estadoPago: true,
      metodoPago: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
  },
  viaje: {
    select: {
      id: true,
      fecha: true,
      estado: true,
      horarioRuta: {
        select: {
          id: true,
          horaSalida: true,
          ruta: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
      bus: {
        select: {
          id: true,
          numero: true,
          placa: true,
        },
      },
    },
  },
  cliente: {
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      tipoDocumento: true,
      numeroDocumento: true,
      telefono: true,
      email: true,
    },
  },
  asiento: {
    select: {
      id: true,
      numero: true,
      fila: true,
      columna: true,
      tipo: {
        select: {
          id: true,
          nombre: true,
          factorPrecio: true,
        },
      },
    },
  },
  paradaOrigen: {
    select: {
      id: true,
      orden: true,
      precioAcumulado: true,
      ciudad: {
        select: {
          id: true,
          nombre: true,
          provincia: true,
        },
      },
    },
  },
  paradaDestino: {
    select: {
      id: true,
      orden: true,
      precioAcumulado: true,
      ciudad: {
        select: {
          id: true,
          nombre: true,
          provincia: true,
        },
      },
    },
  },
}; 