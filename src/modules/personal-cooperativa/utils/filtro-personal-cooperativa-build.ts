import { Prisma } from '@prisma/client';
import { FiltroPersonalCooperativaDto } from '../dto/filtro-personal-cooperativa.dto';

export const filtroPersonalCooperativaBuild = (
  filtro: FiltroPersonalCooperativaDto,
): Prisma.PersonalCooperativaWhereInput => {
  const where: Prisma.PersonalCooperativaWhereInput = {};

  const {
    nombres,
    apellidos,
    tipoDocumento,
    numeroDocumento,
    email,
    ciudadResidencia,
    usuarioTenantId,
    activo,
  } = filtro;

  if (nombres) {
    where.nombres = { contains: nombres };
  }

  if (apellidos) {
    where.apellidos = { contains: apellidos };
  }

  if (tipoDocumento) {
    where.tipoDocumento = tipoDocumento;
  }

  if (numeroDocumento) {
    where.numeroDocumento = numeroDocumento;
  }

  if (email) {
    where.email = { contains: email };
  }

  if (ciudadResidencia) {
    where.ciudadResidencia = { contains: ciudadResidencia };
  }

  if (usuarioTenantId) {
    where.usuarioTenantId = usuarioTenantId;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
};
