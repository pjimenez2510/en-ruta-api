import { Prisma } from '@prisma/client';

export const VIAJE_SELECT: Prisma.ViajeSelect = {
  id: true,
  tenantId: true,
  conductorId: true,
  ayudanteId: true,
  fecha: true,
  horaSalidaReal: true,
  estado: true,
  observaciones: true,
  capacidadTotal: true,
  asientosOcupados: true,
  generacion: true,
};

export const VIAJE_SELECT_WITH_RELATIONS: Prisma.ViajeSelect = {
  ...VIAJE_SELECT,
  horarioRuta: {
    select: {
      id: true,
      horaSalida: true,
      ruta: {
        select: {
          id: true,
          nombre: true,
          descripcion: true,
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
};

export const VIAJE_SELECT_WITH_RELATIONS_WITH_PARADAS: Prisma.ViajeSelect = {
  ...VIAJE_SELECT,
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
              tiempoAcumulado: true,
              orden: true,
              precioAcumulado: true,
              ciudad: {
                select: {
                  id: true,
                  nombre: true,
                  provincia: true
                },
              },
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
};
