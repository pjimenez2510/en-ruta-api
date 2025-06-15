import { Prisma } from '@prisma/client';

export const CONFIGURACION_DESCUENTO_SELECT: Prisma.ConfiguracionDescuentoSelect = {
  id: true,
  tenantId: true,
  tipo: true,
  porcentaje: true,
  requiereValidacion: true,
  activo: true,
};

export const CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS: Prisma.ConfiguracionDescuentoSelect = {
  ...CONFIGURACION_DESCUENTO_SELECT,
  tenant: true,
}; 