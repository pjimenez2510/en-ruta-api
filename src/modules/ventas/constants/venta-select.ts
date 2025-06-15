import { Prisma } from '@prisma/client';

export const VENTA_SELECT: Prisma.VentaSelect = {
  id: true,
  tenantId: true,
  viajeId: true,
  usuarioId: true,
  oficinistaId: true,
  fechaVenta: true,
  metodoPagoId: true,
  totalSinDescuento: true,
  totalDescuentos: true,
  totalFinal: true,
  estadoPago: true,
};

export const VENTA_SELECT_WITH_RELATIONS: Prisma.VentaSelect = {
  ...VENTA_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
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
  comprador: {
    select: {
      id: true,
      username: true,
    },
  },
  oficinista: {
    select: {
      id: true,
      username: true,
    },
  },
  metodoPago: {
    select: {
      id: true,
      nombre: true,
      descripcion: true,
    },
  },
  boletos: {
    select: {
      id: true,
      clienteId: true,
      asientoId: true,
      paradaOrigenId: true,
      paradaDestinoId: true,
      precioBase: true,
      tipoDescuento: true,
      porcentajeDescuento: true,
      precioFinal: true,
      codigoAcceso: true,
      estado: true,
    },
  },
};

export const VENTA_SELECT_WITH_FULL_RELATIONS: Prisma.VentaSelect = {
  ...VENTA_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
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
              descripcion: true,
              paradas: {
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
                orderBy: {
                  orden: 'asc',
                },
              },
            },
          },
        },
      },
      bus: {
        select: {
          id: true,
          numero: true,
          placa: true,
          totalAsientos: true,
        },
      },
    },
  },
  comprador: {
    select: {
      id: true,
      username: true,
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
    },
  },
  oficinista: {
    select: {
      id: true,
      username: true,
    },
  },
  metodoPago: {
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      procesador: true,
    },
  },
  boletos: {
    select: {
      id: true,
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
    },
  },
}; 