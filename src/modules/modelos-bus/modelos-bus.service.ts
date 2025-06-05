import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateModeloBusDto, UpdateModeloBusDto } from './dto';
import {
  MODELO_BUS_SELECT,
  MODELO_BUS_SELECT_WITH_RELATIONS,
} from './constants/modelos-bus-select';

@Injectable()
export class ModelosBusService {
  constructor(private prisma: PrismaService) {}

  async obtenerModelosBus(
    filtro: Prisma.ModeloBusWhereInput,
    args: Prisma.ModeloBusSelect = MODELO_BUS_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.modeloBus.findMany({
      where: filtro,
      orderBy: [{ marca: 'asc' }, { modelo: 'asc' }],
      select: args,
    });
  }

  async obtenerModeloBus(
    filtro: Prisma.ModeloBusWhereUniqueInput,
    args: Prisma.ModeloBusSelect = MODELO_BUS_SELECT_WITH_RELATIONS,
  ) {
    const modeloBus = await this.prisma.modeloBus.findUnique({
      where: filtro,
      select: args,
    });

    if (!modeloBus) {
      throw new NotFoundException(
        `Modelo de bus con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return modeloBus;
  }

  async crearModeloBus(
    datos: CreateModeloBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    const existente = await this.prisma.modeloBus.findUnique({
      where: {
        marca_modelo: {
          marca: datos.marca,
          modelo: datos.modelo,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un modelo de bus con la marca ${datos.marca} y modelo ${datos.modelo}`,
      );
    }

    return await (tx || this.prisma).modeloBus.create({
      data: {
        marca: datos.marca,
        modelo: datos.modelo,
        tipoChasis: datos.tipoChasis,
        tipoCarroceria: datos.tipoCarroceria,
        anioModelo: datos.anioModelo,
        numeroPisos: datos.numeroPisos || 1,
        descripcion: datos.descripcion,
        esPublico: datos.esPublico !== undefined ? datos.esPublico : true,
      },
      select: MODELO_BUS_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarModeloBus(
    id: number,
    datos: UpdateModeloBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerModeloBus({ id });

    if (datos.marca && datos.modelo) {
      const existente = await this.prisma.modeloBus.findFirst({
        where: {
          marca: datos.marca,
          modelo: datos.modelo,
          NOT: { id },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un modelo de bus con la marca ${datos.marca} y modelo ${datos.modelo}`,
        );
      }
    }

    return await (tx || this.prisma).modeloBus.update({
      where: { id },
      data: datos,
      select: MODELO_BUS_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarModeloBus(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerModeloBus({ id });

    const busesAsociados = await this.prisma.bus.count({
      where: { modeloBusId: id },
    });

    if (busesAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar el modelo porque está siendo utilizado por ${busesAsociados} buses`,
      );
    }

    await (tx || this.prisma).plantillaPiso.deleteMany({
      where: { modeloBusId: id },
    });

    return await (tx || this.prisma).modeloBus.delete({
      where: { id },
      select: MODELO_BUS_SELECT_WITH_RELATIONS,
    });
  }
}
