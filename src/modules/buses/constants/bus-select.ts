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
