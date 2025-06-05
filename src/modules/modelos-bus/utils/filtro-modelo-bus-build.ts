import { Prisma } from '@prisma/client';
import { FiltroModeloBusDto } from '../dto/filtro-modelo-bus.dto';

export const filtroModeloBusBuild = (
  filtro: FiltroModeloBusDto,
): Prisma.ModeloBusWhereInput => {
  const where: Prisma.ModeloBusWhereInput = {};

  const {
    marca,
    modelo,
    tipoChasis,
    tipoCarroceria,
    anioModelo,
    numeroPisos,
    esPublico,
  } = filtro;

  if (marca) {
    where.marca = { contains: marca, mode: 'insensitive' };
  }

  if (modelo) {
    where.modelo = { contains: modelo, mode: 'insensitive' };
  }

  if (tipoChasis) {
    where.tipoChasis = { contains: tipoChasis, mode: 'insensitive' };
  }

  if (tipoCarroceria) {
    where.tipoCarroceria = { contains: tipoCarroceria, mode: 'insensitive' };
  }

  if (anioModelo !== undefined) {
    where.anioModelo = anioModelo;
  }

  if (numeroPisos !== undefined) {
    where.numeroPisos = numeroPisos;
  }

  if (esPublico !== undefined) {
    where.esPublico = esPublico;
  }

  return where;
};
