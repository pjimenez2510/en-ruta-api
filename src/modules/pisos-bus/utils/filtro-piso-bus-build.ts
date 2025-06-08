import { Prisma } from '@prisma/client';
import { FiltroPisoBusDto } from '../dto/filtro-piso-bus.dto';

export const filtroPisoBusBuild = (
  filtro: FiltroPisoBusDto,
  tenantId?: number,
): Prisma.PisoBusWhereInput => {
  const where: Prisma.PisoBusWhereInput = {};

  const { busId, numeroPiso, plantillaPisoId } = filtro;

  if (busId !== undefined) {
    where.busId = busId;
  }

  if (numeroPiso !== undefined) {
    where.numeroPiso = numeroPiso;
  }

  if (plantillaPisoId !== undefined) {
    where.plantillaPisoId = plantillaPisoId;
  }

  // Filtrar por tenant si se proporciona
  if (tenantId !== undefined) {
    where.bus = {
      tenantId,
    };
  }

  return where;
};
