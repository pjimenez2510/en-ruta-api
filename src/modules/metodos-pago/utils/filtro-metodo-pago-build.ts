import { Prisma } from '@prisma/client';
import { FiltroMetodoPagoDto } from '../dto/filtro-metodo-pago.dto';

export const filtroMetodoPagoBuild = (
  filtro: FiltroMetodoPagoDto,
  tenantId?: number,
): Prisma.MetodoPagoWhereInput => {
  const where: Prisma.MetodoPagoWhereInput = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const { nombre, procesador, activo } = filtro;

  if (nombre) {
    where.nombre = {
      contains: nombre,
      mode: 'insensitive',
    };
  }

  if (procesador) {
    where.procesador = {
      contains: procesador,
      mode: 'insensitive',
    };
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
}; 