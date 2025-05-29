import { Prisma } from '@prisma/client';
import { FiltroTenantDto } from '../dto/filtro-tenant.dto';

export const filtroTenantBuild = (
  filtro: FiltroTenantDto,
): Prisma.TenantWhereInput => {
  const where: Prisma.TenantWhereInput = {};

  const {
    nombre,
    sitioWeb,
    telefono,
    activo,
    colorPrimario,
    colorSecundario,
    emailContacto,
    identificador,
    logoUrl,
  } = filtro;

  console.log(activo);

  if (nombre) {
    where.nombre = { contains: nombre };
  }

  if (sitioWeb) {
    where.sitioWeb = { contains: sitioWeb };
  }

  if (telefono) {
    where.telefono = { contains: telefono };
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  if (colorPrimario) {
    where.colorPrimario = { contains: colorPrimario };
  }

  if (colorSecundario) {
    where.colorSecundario = { contains: colorSecundario };
  }

  if (emailContacto) {
    where.emailContacto = { equals: emailContacto };
  }

  if (identificador) {
    where.identificador = { equals: identificador };
  }

  if (logoUrl) {
    where.logoUrl = { contains: logoUrl };
  }

  return where;
};
