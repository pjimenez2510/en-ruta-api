import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBusDto, UpdateBusDto } from './dto';
import { BUS_SELECT, BUS_SELECT_WITH_RELATIONS } from './constants/bus-select';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService) {}

  async obtenerBuses(
    filtro: Prisma.BusWhereInput,
    args: Prisma.BusSelect = BUS_SELECT,
  ) {
    return await this.prisma.bus.findMany({
      where: filtro,
      orderBy: { numero: 'asc' },
      select: args,
    });
  }

  async obtenerBus(
    filtro: Prisma.BusWhereUniqueInput,
    args: Prisma.BusSelect = BUS_SELECT_WITH_RELATIONS,
  ) {
    const bus = await this.prisma.bus.findUnique({
      where: filtro,
      select: args,
    });

    if (!bus) {
      throw new NotFoundException(
        `Bus con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return bus;
  }

  async crearBus(
    tenantId: number,
    datos: CreateBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    // Verificar si ya existe un bus con el mismo número en este tenant
    const existenteNumero = await this.prisma.bus.findUnique({
      where: {
        tenantId_numero: {
          tenantId,
          numero: datos.numero,
        },
      },
    });

    if (existenteNumero) {
      throw new ConflictException(
        `Ya existe un bus con el número ${datos.numero} en este tenant`,
      );
    }

    // Verificar si ya existe un bus con la misma placa en este tenant
    const existentePlaca = await this.prisma.bus.findUnique({
      where: {
        tenantId_placa: {
          tenantId,
          placa: datos.placa,
        },
      },
    });

    if (existentePlaca) {
      throw new ConflictException(
        `Ya existe un bus con la placa ${datos.placa} en este tenant`,
      );
    }

    return await (tx || this.prisma).bus.create({
      data: {
        ...datos,
        tenantId,
      },
      select: BUS_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarBus(
    id: number,
    tenantId: number,
    datos: UpdateBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerBus({ id });

    if (datos.numero) {
      const existenteNumero = await this.prisma.bus.findFirst({
        where: {
          tenantId,
          numero: datos.numero,
          NOT: {
            id,
          },
        },
      });

      if (existenteNumero) {
        throw new ConflictException(
          `Ya existe un bus con el número ${datos.numero} en este tenant`,
        );
      }
    }

    if (datos.placa) {
      const existentePlaca = await this.prisma.bus.findFirst({
        where: {
          tenantId,
          placa: datos.placa,
          NOT: {
            id,
          },
        },
      });

      if (existentePlaca) {
        throw new ConflictException(
          `Ya existe un bus con la placa ${datos.placa} en este tenant`,
        );
      }
    }

    return await (tx || this.prisma).bus.update({
      where: { id },
      data: datos,
      select: BUS_SELECT_WITH_RELATIONS,
    });
  }

  async cambiarEstadoBus(
    id: number,
    estado: Prisma.EnumEstadoBusFieldUpdateOperationsInput,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerBus({ id });

    return await (tx || this.prisma).bus.update({
      where: { id },
      data: { estado },
      select: BUS_SELECT_WITH_RELATIONS,
    });
  }
}
