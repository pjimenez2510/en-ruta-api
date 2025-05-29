import { Prisma } from '@prisma/client';
import { FiltroUsuarioDto } from '../dto/filtro-usuario.dto';

export const filtroUsuarioBuild = (
  filtro: FiltroUsuarioDto,
): Prisma.UsuarioWhereInput => {
  const where: Prisma.UsuarioWhereInput = {};

  const { email, tipoUsuario, activo } = filtro;

  if (email) {
    where.email = { contains: email };
  }

  if (tipoUsuario) {
    where.tipoUsuario = tipoUsuario;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
};
