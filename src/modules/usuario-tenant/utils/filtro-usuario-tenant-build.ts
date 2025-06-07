import { Prisma } from '@prisma/client';
import { FiltroUsuarioTenantDto } from '../dto/filtro-usuario-tenant.dto';

export const filtroUsuarioTenantBuild = (
  filtro: FiltroUsuarioTenantDto,
  tenantId?: number,
): Prisma.UsuarioTenantWhereInput => {
  const where: Prisma.UsuarioTenantWhereInput = {};

  const { usuarioId, rol, activo } = filtro;

  if (usuarioId !== undefined) {
    where.usuarioId = usuarioId;
  }

  if (tenantId !== undefined) {
    where.tenantId = tenantId;
  }

  if (rol !== undefined) {
    where.rol = rol;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
};
