import { Prisma } from '@prisma/client';

export const CLIENTE_SELECT: Prisma.ClienteSelect = {
  id: true,
  nombres: true,
  apellidos: true,
  telefono: true,
  email: true,
  fechaRegistro: true,
  ultimaActualizacion: true,
  activo: true,
  esDiscapacitado: true,
  porcentajeDiscapacidad: true,
  numeroDocumento: true,
  tipoDocumento: true,
  fechaNacimiento: true,
};
