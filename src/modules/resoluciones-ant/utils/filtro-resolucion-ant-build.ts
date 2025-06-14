import { Prisma } from '@prisma/client';
import { FiltroResolucionAntDto } from '../dto/filtro-resolucion-ant.dto';

export const filtroResolucionAntBuild = (
  filtro: FiltroResolucionAntDto,
): Prisma.ResolucionANTWhereInput => {
  const where: Prisma.ResolucionANTWhereInput = {};

  const {
    numeroResolucion,
    fechaEmisionDesde,
    fechaEmisionHasta,
    fechaVigenciaDesde,
    fechaVigenciaHasta,
    descripcion,
    activo,
  } = filtro;

  if (numeroResolucion) {
    where.numeroResolucion = { 
      contains: numeroResolucion, 
      mode: 'insensitive' 
    };
  }

  if (fechaEmisionDesde || fechaEmisionHasta) {
    where.fechaEmision = {};
    if (fechaEmisionDesde) {
      where.fechaEmision.gte = fechaEmisionDesde;
    }
    if (fechaEmisionHasta) {
      where.fechaEmision.lte = fechaEmisionHasta;
    }
  }

  if (fechaVigenciaDesde || fechaVigenciaHasta) {
    where.fechaVigencia = {};
    if (fechaVigenciaDesde) {
      where.fechaVigencia.gte = fechaVigenciaDesde;
    }
    if (fechaVigenciaHasta) {
      where.fechaVigencia.lte = fechaVigenciaHasta;
    }
  }

  if (descripcion) {
    where.descripcion = { 
      contains: descripcion, 
      mode: 'insensitive' 
    };
  }

  if (activo !== undefined) {
    where.activo = activo;
  }

  return where;
}; 