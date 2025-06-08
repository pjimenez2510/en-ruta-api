import { Prisma } from '@prisma/client';
import { ASIENTO_SELECT } from 'src/modules/asientos/constants/asiento-select';

export const PISO_BUS_SELECT: Prisma.PisoBusSelect = {
  id: true,
  busId: true,
  numeroPiso: true,
  plantillaPisoId: true,
  asientos: {
    select: ASIENTO_SELECT,
  },
};
