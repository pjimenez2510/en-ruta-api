import { Prisma } from '@prisma/client';
import { FiltroClienteDto } from '../dto/filtro-cliente.dto';

export const filtroClienteBuild = (
  filtro: FiltroClienteDto,
): Prisma.ClienteWhereInput => {
  const where: Prisma.ClienteWhereInput = {};

  const {
    nombres,
    apellidos,
    tipoDocumento,
    numeroDocumento,
    telefono,
    email,
    esDiscapacitado,
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
    where.numeroDocumento = { contains: numeroDocumento };
  }

  if (telefono) {
    where.telefono = { contains: telefono };
  }

  if (email) {
    where.email = { contains: email };
  }

  if (esDiscapacitado !== undefined) {
    where.esDiscapacitado = esDiscapacitado;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
};
