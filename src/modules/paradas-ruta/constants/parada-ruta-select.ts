import { Prisma } from '@prisma/client';
import { CIUDAD_SELECT } from 'src/modules/ciudades/constants/ciudad-select';

export const PARADA_RUTA_SELECT: Prisma.ParadaRutaSelect = {
  id: true,
  rutaId: true,
  ciudadId: true,
  orden: true,
  distanciaAcumulada: true,
  tiempoAcumulado: true,
  precioAcumulado: true,
};

export const PARADA_RUTA_SELECT_WITH_RELATIONS: Prisma.ParadaRutaSelect = {
  ...PARADA_RUTA_SELECT,
  ciudad: {
    select: {
      ...CIUDAD_SELECT,
    },
  },
}; 