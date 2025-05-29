import { Prisma } from '@prisma/client';

export const CONFIGURACIONES_TENANT_SELECT: Prisma.ConfiguracionSelect = {
  id: true,
  clave: true,
  valor: true,
  tipo: true,
  descripcion: true,
  fechaModificacion: true,
  tenantId: true,
};

export const CONFIGURACIONES_TENANT_SELECT_WITH_RELATIONS: Prisma.ConfiguracionSelect =
  {
    ...CONFIGURACIONES_TENANT_SELECT,
  };
