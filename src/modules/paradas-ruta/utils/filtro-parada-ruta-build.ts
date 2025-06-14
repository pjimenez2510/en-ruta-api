import { Prisma } from '@prisma/client';
import { FiltroParadaRutaDto } from '../dto/filtro-parada-ruta.dto';

export const filtroParadaRutaBuild = (
  filtro: FiltroParadaRutaDto,
  tenantId?: number,
): Prisma.ParadaRutaWhereInput => {
  const where: Prisma.ParadaRutaWhereInput = {};

  // Filtrar por tenant a través de la relación con ruta
  if (tenantId) {
    where.ruta = {
      tenantId: tenantId,
    };
  }

  const { rutaId, ciudadId, orden } = filtro;

  if (rutaId !== undefined) {
    where.rutaId = rutaId;
  }

  if (ciudadId !== undefined) {
    where.ciudadId = ciudadId;
  }

  if (orden !== undefined) {
    where.orden = orden;
  }

  return where;
}; 