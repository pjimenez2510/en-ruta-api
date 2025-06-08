import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePisoBusDto, UpdatePisoBusDto } from './dto';
import { PISO_BUS_SELECT } from './constants/piso-bus-select';

@Injectable()
export class PisosBusService {
  constructor(private prisma: PrismaService) {}

  async obtenerPisosBus({
    filtro,
    args = PISO_BUS_SELECT,
    tx,
  }: {
    filtro: Prisma.PisoBusWhereInput;
    args?: Prisma.PisoBusSelect;
    tx?: Prisma.TransactionClient;
  }) {
    return await (tx || this.prisma).pisoBus.findMany({
      where: filtro,
      orderBy: [{ busId: 'asc' }, { numeroPiso: 'asc' }],
      select: args,
    });
  }

  async obtenerPisoBus({
    filtro,
    args = PISO_BUS_SELECT,
    tx,
  }: {
    filtro: Prisma.PisoBusWhereUniqueInput;
    args?: Prisma.PisoBusSelect;
    tx?: Prisma.TransactionClient;
  }) {
    const pisoBus = await (tx || this.prisma).pisoBus.findUnique({
      where: filtro,
      select: args,
    });

    if (!pisoBus) {
      throw new NotFoundException(
        `Piso de bus con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return pisoBus;
  }

  async crearPisoBus(datos: CreatePisoBusDto, tx?: Prisma.TransactionClient) {
    const bus = await (tx || this.prisma).bus.findUnique({
      where: { id: datos.busId },
    });

    if (!bus) {
      throw new NotFoundException(
        `No se encontró el bus con ID ${datos.busId}`,
      );
    }

    if (datos.plantillaPisoId) {
      const plantillaPiso = await (tx || this.prisma).plantillaPiso.findUnique({
        where: { id: datos.plantillaPisoId },
      });

      if (!plantillaPiso) {
        throw new NotFoundException(
          `No se encontró la plantilla de piso con ID ${datos.plantillaPisoId}`,
        );
      }
    }

    const existente = await (tx || this.prisma).pisoBus.findUnique({
      where: {
        busId_numeroPiso: {
          busId: datos.busId,
          numeroPiso: datos.numeroPiso,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un piso con el número ${datos.numeroPiso} en el bus con ID ${datos.busId}`,
      );
    }

    return await (tx || this.prisma).pisoBus.create({
      data: datos,
      select: PISO_BUS_SELECT,
    });
  }

  async actualizarPisoBus(
    id: number,
    datos: UpdatePisoBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    const pisoActual = await this.obtenerPisoBus({ filtro: { id }, tx });

    if (
      (datos.numeroPiso !== undefined &&
        datos.numeroPiso !== pisoActual.numeroPiso) ||
      (datos.busId !== undefined && datos.busId !== pisoActual.busId)
    ) {
      const busId = datos.busId !== undefined ? datos.busId : pisoActual.busId;
      const numeroPiso =
        datos.numeroPiso !== undefined
          ? datos.numeroPiso
          : pisoActual.numeroPiso;

      if (datos.busId !== undefined && datos.busId !== pisoActual.busId) {
        const bus = await (tx || this.prisma).bus.findUnique({
          where: { id: datos.busId },
        });

        if (!bus) {
          throw new NotFoundException(
            `No se encontró el bus con ID ${datos.busId}`,
          );
        }
      }

      const existente = await (tx || this.prisma).pisoBus.findUnique({
        where: {
          busId_numeroPiso: {
            busId,
            numeroPiso,
          },
        },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException(
          `Ya existe un piso con el número ${numeroPiso} en el bus con ID ${busId}`,
        );
      }
    }

    if (
      datos.plantillaPisoId !== undefined &&
      datos.plantillaPisoId !== pisoActual.plantillaPisoId
    ) {
      const plantillaPiso = await (tx || this.prisma).plantillaPiso.findUnique({
        where: { id: datos.plantillaPisoId },
      });

      if (!plantillaPiso) {
        throw new NotFoundException(
          `No se encontró la plantilla de piso con ID ${datos.plantillaPisoId}`,
        );
      }
    }

    return await (tx || this.prisma).pisoBus.update({
      where: { id },
      data: datos,
      select: PISO_BUS_SELECT,
    });
  }

  async eliminarPisoBus(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerPisoBus({ filtro: { id }, tx });

    const asientosAsociados = await (tx || this.prisma).asiento.count({
      where: { pisoBusId: id },
    });

    if (asientosAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar el piso porque tiene ${asientosAsociados} asientos asociados`,
      );
    }

    return await (tx || this.prisma).pisoBus.delete({
      where: { id },
      select: PISO_BUS_SELECT,
    });
  }
}
