import { Prisma } from '@prisma/client';
import { FiltroConfiguracionDescuentoDto } from '../dto/filtro-configuracion-descuento.dto';

export const filtroConfiguracionDescuentoBuild = (
  filtro: FiltroConfiguracionDescuentoDto,
  tenantId?: number,
): Prisma.ConfiguracionDescuentoWhereInput => {
  const where: Prisma.ConfiguracionDescuentoWhereInput = {};

  if (tenantId) {
    where.tenantId = tenantId;
  }

  const { tipo, porcentajeMinimo, porcentajeMaximo, requiereValidacion, activo } = filtro;

  if (tipo) {
    where.tipo = tipo;
  }

  if (porcentajeMinimo !== undefined || porcentajeMaximo !== undefined) {
    where.porcentaje = {};
    
    if (porcentajeMinimo !== undefined) {
      where.porcentaje.gte = porcentajeMinimo;
    }
    
    if (porcentajeMaximo !== undefined) {
      where.porcentaje.lte = porcentajeMaximo;
    }
  }

  if (requiereValidacion !== undefined) {
    where.requiereValidacion = requiereValidacion;
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
}; 