import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePlantillaPisoDto, UpdatePlantillaPisoDto } from './dto';
import {
  PLANTILLA_PISO_SELECT,
  PLANTILLA_PISO_SELECT_WITH_RELATIONS,
} from './constants/plantilla-piso-select';

@Injectable()
export class PlantillaPisosService {
  constructor(private prisma: PrismaService) {}

  async obtenerPlantillasPiso({
    filtro,
    args = PLANTILLA_PISO_SELECT,
    tx,
  }: {
    filtro: Prisma.PlantillaPisoWhereInput;
    args?: Prisma.PlantillaPisoSelect;
    tx?: Prisma.TransactionClient;
  }) {
    return await (tx || this.prisma).plantillaPiso.findMany({
      where: filtro,
      orderBy: [{ modeloBusId: 'asc' }, { numeroPiso: 'asc' }],
      select: args,
    });
  }

  async obtenerPlantillaPiso({
    filtro,
    args = PLANTILLA_PISO_SELECT_WITH_RELATIONS,
    tx,
  }: {
    filtro: Prisma.PlantillaPisoWhereUniqueInput;
    args?: Prisma.PlantillaPisoSelect;
    tx?: Prisma.TransactionClient;
  }) {
    const plantillaPiso = await (tx || this.prisma).plantillaPiso.findUnique({
      where: filtro,
      select: args,
    });

    if (!plantillaPiso) {
      throw new NotFoundException(
        `Plantilla de piso con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return plantillaPiso;
  }

  async crearPlantillaPiso(
    datos: CreatePlantillaPisoDto,
    tx?: Prisma.TransactionClient,
  ) {
    const modeloBus = await (tx || this.prisma).modeloBus.findUnique({
      where: { id: datos.modeloBusId },
    });

    if (!modeloBus) {
      throw new NotFoundException(
        `No se encontró el modelo de bus con ID ${datos.modeloBusId}`,
      );
    }

    const existente = await (tx || this.prisma).plantillaPiso.findUnique({
      where: {
        modeloBusId_numeroPiso: {
          modeloBusId: datos.modeloBusId,
          numeroPiso: datos.numeroPiso,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una plantilla para el piso ${datos.numeroPiso} en el modelo de bus con ID ${datos.modeloBusId}`,
      );
    }

    return await (tx || this.prisma).plantillaPiso.create({
      data: {
        ...datos,
      },
      select: PLANTILLA_PISO_SELECT,
    });
  }

  async actualizarPlantillaPiso(
    id: number,
    datos: UpdatePlantillaPisoDto,
    tx?: Prisma.TransactionClient,
  ) {
    const plantillaActual = await this.obtenerPlantillaPiso({
      filtro: { id },
      tx,
    });

    if (datos.modeloBusId !== undefined || datos.numeroPiso !== undefined) {
      const modeloBusId =
        datos.modeloBusId !== undefined
          ? datos.modeloBusId
          : plantillaActual.modeloBusId;
      const numeroPiso =
        datos.numeroPiso !== undefined
          ? datos.numeroPiso
          : plantillaActual.numeroPiso;

      if (
        modeloBusId !== plantillaActual.modeloBusId ||
        numeroPiso !== plantillaActual.numeroPiso
      ) {
        const modeloBus = await (tx || this.prisma).modeloBus.findUnique({
          where: { id: modeloBusId },
        });

        if (!modeloBus) {
          throw new NotFoundException(
            `No se encontró el modelo de bus con ID ${modeloBusId}`,
          );
        }

        const existente = await (tx || this.prisma).plantillaPiso.findUnique({
          where: {
            modeloBusId_numeroPiso: {
              modeloBusId,
              numeroPiso,
            },
          },
        });

        if (existente && existente.id !== id) {
          throw new ConflictException(
            `Ya existe una plantilla para el piso ${numeroPiso} en el modelo de bus con ID ${modeloBusId}`,
          );
        }
      }
    }

    return await (tx || this.prisma).plantillaPiso.update({
      where: { id },
      data: datos,
      select: PLANTILLA_PISO_SELECT,
    });
  }

  async eliminarPlantillaPiso(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerPlantillaPiso({ filtro: { id }, tx });

    const ubicacionesAsociadas = await (
      tx || this.prisma
    ).ubicacionAsientoPlantilla.count({
      where: { plantillaPisoId: id },
    });

    if (ubicacionesAsociadas > 0) {
      throw new ConflictException(
        `No se puede eliminar la plantilla de piso porque tiene ${ubicacionesAsociadas} ubicaciones de asientos asociadas`,
      );
    }

    const pisosAsociados = await (tx || this.prisma).pisoBus.count({
      where: { plantillaPisoId: id },
    });

    if (pisosAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar la plantilla de piso porque está siendo utilizada por ${pisosAsociados} pisos de buses`,
      );
    }

    return await (tx || this.prisma).plantillaPiso.delete({
      where: { id },
      select: PLANTILLA_PISO_SELECT,
    });
  }

  async cambiarEstadoPublicoPlantillaPiso(
    id: number,
    esPublico: boolean,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerPlantillaPiso({ filtro: { id }, tx });

    return await (tx || this.prisma).plantillaPiso.update({
      where: { id },
      data: { esPublico },
      select: PLANTILLA_PISO_SELECT,
    });
  }
}
