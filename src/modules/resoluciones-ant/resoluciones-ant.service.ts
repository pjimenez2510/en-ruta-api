import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateResolucionAntDto, UpdateResolucionAntDto } from './dto';
import { RESOLUCION_ANT_SELECT } from './constants/resolucion-ant-select';

@Injectable()
export class ResolucionesAntService {
  constructor(private prisma: PrismaService) {}

  async obtenerResoluciones(
    filtro: Prisma.ResolucionANTWhereInput,
    args: Prisma.ResolucionANTSelect = RESOLUCION_ANT_SELECT,
  ) {
    return await this.prisma.resolucionANT.findMany({
      where: filtro,
      orderBy: { fechaEmision: 'desc' },
      select: args,
    });
  }

  async obtenerResolucion(
    filtro: Prisma.ResolucionANTWhereUniqueInput,
    args: Prisma.ResolucionANTSelect = RESOLUCION_ANT_SELECT,
  ) {
    const resolucion = await this.prisma.resolucionANT.findUnique({
      where: filtro,
      select: args,
    });

    if (!resolucion) {
      throw new NotFoundException(
        `Resolución ANT con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return resolucion;
  }

  async crearResolucion(
    datos: CreateResolucionAntDto,
    tx?: Prisma.TransactionClient,
  ) {
    console.log('datos', datos);
    
    // Verificar si ya existe una resolución con el mismo número
    const existente = await this.prisma.resolucionANT.findFirst({
      where: {
        numeroResolucion: datos.numeroResolucion,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una resolución ANT con el número ${datos.numeroResolucion}`,
      );
    }

    return await (tx || this.prisma).resolucionANT.create({
      data: datos,
      select: RESOLUCION_ANT_SELECT,
    });
  }

  async actualizarResolucion(
    id: number,
    datos: UpdateResolucionAntDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerResolucion({ id });

    // Verificar si el número de resolución ya existe en otra resolución
    if (datos.numeroResolucion) {
      const existente = await this.prisma.resolucionANT.findFirst({
        where: {
          numeroResolucion: datos.numeroResolucion,
          NOT: {
            id,
          },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe una resolución ANT con el número ${datos.numeroResolucion}`,
        );
      }
    }

    return await (tx || this.prisma).resolucionANT.update({
      where: { id },
      data: datos,
      select: RESOLUCION_ANT_SELECT,
    });
  }

  async desactivarResolucion(
    id: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerResolucion({ id });

    return await (tx || this.prisma).resolucionANT.update({
      where: { id },
      data: { activo: false },
      select: RESOLUCION_ANT_SELECT,
    });
  }

  async activarResolucion(
    id: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerResolucion({ id });

    return await (tx || this.prisma).resolucionANT.update({
      where: { id },
      data: { activo: true },
      select: RESOLUCION_ANT_SELECT,
    });
  }
} 