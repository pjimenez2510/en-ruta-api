import { Prisma } from '@prisma/client';

export const METODO_PAGO_SELECT: Prisma.MetodoPagoSelect = {
  id: true,
  tenantId: true,
  nombre: true,
  descripcion: true,
  procesador: true,
  configuracion: true,
  activo: true,
};

export const METODO_PAGO_SELECT_WITH_RELATIONS: Prisma.MetodoPagoSelect = {
  ...METODO_PAGO_SELECT,
  tenant: true,
}; 