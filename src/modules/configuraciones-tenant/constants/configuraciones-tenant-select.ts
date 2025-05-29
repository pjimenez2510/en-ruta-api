import { Prisma } from '@prisma/client';

export const CONFIGURACIONES_TENANT_SELECT: Prisma.ConfiguracionSelect = {
  id: true,
  valor: true,
  clave: true,
  descripcion: true,
  tipo: true,
};
