import { Prisma } from '@prisma/client';
import { FiltroUsuarioDto } from '../dto/filtro-usuario.dto';

export const filtroUsuarioBuild = (
  filtro: FiltroUsuarioDto,
): Prisma.UsuarioWhereInput => {
  const where: Prisma.UsuarioWhereInput = {};

  const { username, tipoUsuario, activo } = filtro;

  if (username) {
    where.username = { contains: username };
  }

  if (tipoUsuario) {
    where.tipoUsuario = tipoUsuario;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
};
