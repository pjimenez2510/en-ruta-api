import { Prisma } from '@prisma/client';
import { FiltroCiudadDto } from '../dto/filtro-ciudad.dto';

export const filtroCiudadBuild = (
  filtro: FiltroCiudadDto,
): Prisma.CiudadWhereInput => {
  const where: Prisma.CiudadWhereInput = {};

  const { nombre, provincia, activo } = filtro;

  if (nombre) {
    where.nombre = { contains: nombre, mode: 'insensitive' };
  }

  if (provincia) {
    where.provincia = { contains: provincia, mode: 'insensitive' };
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
};
