import { Prisma } from '@prisma/client';

export const UBICACION_ASIENTO_PLANTILLA_SELECT: Prisma.UbicacionAsientoPlantillaSelect =
  {
    id: true,
    plantillaPisoId: true,
    fila: true,
    columna: true,
    estaHabilitado: true,
  };
