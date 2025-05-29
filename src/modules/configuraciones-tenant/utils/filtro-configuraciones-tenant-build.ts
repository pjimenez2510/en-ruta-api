import { Prisma } from '@prisma/client';
import { FiltroConfiguracionesTenantDto } from '../dto/filtro-configuraciones-tenant.dto';

export const filtroConfiguracionesTenantBuild = (
  filtro: FiltroConfiguracionesTenantDto,
): Prisma.ConfiguracionWhereInput => {
  const where: Prisma.ConfiguracionWhereInput = {};

  const { clave, valor, tipo, tenantId, descripcion } = filtro;

  if (clave) {
    where.clave = { contains: clave, mode: 'insensitive' };
  }

  if (valor) {
    where.valor = { contains: valor, mode: 'insensitive' };
  }

  if (tipo) {
    where.tipo = tipo;
  }

  if (tenantId !== undefined) {
    where.tenantId = tenantId;
  }

  if (descripcion) {
    where.descripcion = { contains: descripcion, mode: 'insensitive' };
  }

  return where;
};
