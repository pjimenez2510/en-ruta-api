import { Prisma } from '@prisma/client';
import { RUTA_SELECT } from '../../rutas/constants/ruta-select';

export const HORARIO_RUTA_SELECT: Prisma.HorarioRutaSelect = {
  id: true,
  rutaId: true,
  horaSalida: true,
  diasSemana: true,
  activo: true,
};

export const HORARIO_RUTA_SELECT_WITH_RELATIONS: Prisma.HorarioRutaSelect = {
  ...HORARIO_RUTA_SELECT,
  rutaId: true,
}; 