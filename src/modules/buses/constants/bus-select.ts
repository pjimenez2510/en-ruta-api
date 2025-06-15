import { Prisma } from '@prisma/client';

export const BUS_SELECT: Prisma.BusSelect = {
  id: true,
  tenantId: true,
  modeloBusId: true,
  numero: true,
  placa: true,
  anioFabricacion: true,
  totalAsientos: true,
  fotoUrl: true,
  tipoCombustible: true,
  fechaIngreso: true,
  estado: true,
};

export const BUS_SELECT_WITH_RELATIONS: Prisma.BusSelect = {
  ...BUS_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
    },
  },
  modeloBus: {
    select: {
      id: true,
      marca: true,
      modelo: true,
      tipoChasis: true,
      tipoCarroceria: true,
      numeroPisos: true,
    },
  },
};

export type BusWithPisosAndAsientos = Prisma.BusGetPayload<{
  select: typeof BUS_SELECT_WITH_PISOS_AND_ASIENTOS;
}>;

export const BUS_SELECT_WITH_PISOS_AND_ASIENTOS: Prisma.BusSelect = {
  ...BUS_SELECT,
  tenant: {
    select: {
      id: true,
      nombre: true,
    },
  },
  modeloBus: {
    select: {
      id: true,
      marca: true,
      modelo: true,
      tipoChasis: true,
      tipoCarroceria: true,
      numeroPisos: true,
    },
  },
  pisos: {
    select: {
      id: true,
      numeroPiso: true,
      asientos: {
        select: {
          id: true,
          numero: true,
          fila: true,
          columna: true,
          estado: true,
          notas: true,
          tipo: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              factorPrecio: true,
              color: true,
              icono: true,
            },
          },
        },
        orderBy: [
          { fila: 'asc' },
          { columna: 'asc' },
        ],
      },
    },
    orderBy: {
      numeroPiso: 'asc',
    },
  },
};
