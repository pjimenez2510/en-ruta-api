import { Prisma } from '@prisma/client';
import { FiltroBusDto } from '../dto/filtro-bus.dto';

export const filtroBusBuild = (
  filtro: FiltroBusDto,
  tenantId?: number,
): Prisma.BusWhereInput => {
  const where: Prisma.BusWhereInput = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const {
    numero,
    placa,
    anioFabricacion,
    tipoCombustible,
    modeloBusId,
    estado,
  } = filtro;

  if (numero !== undefined) {
    where.numero = numero;
  }

  if (placa) {
    where.placa = { contains: placa, mode: 'insensitive' };
  }

  if (anioFabricacion !== undefined) {
    where.anioFabricacion = anioFabricacion;
  }

  if (tipoCombustible) {
    where.tipoCombustible = { contains: tipoCombustible, mode: 'insensitive' };
  }

  if (modeloBusId !== undefined) {
    where.modeloBusId = modeloBusId;
  }

  if (estado) {
    where.estado = estado;
  }

  return where;
};
