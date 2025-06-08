import { Prisma } from '@prisma/client';
import { UBICACION_ASIENTO_PLANTILLA_SELECT } from 'src/modules/ubicacion-asiento-plantillas/constants/ubicacion-asiento-plantilla-select';

export const PLANTILLA_PISO_SELECT: Prisma.PlantillaPisoSelect = {
  id: true,
  modeloBusId: true,
  numeroPiso: true,
  filas: true,
  columnas: true,
  descripcion: true,
  esPublico: true,
};

export const PLANTILLA_PISO_SELECT_WITH_RELATIONS: Prisma.PlantillaPisoSelect =
  {
    ...PLANTILLA_PISO_SELECT,
    ubicacionesAsiento: {
      select: UBICACION_ASIENTO_PLANTILLA_SELECT,
    },
  };
