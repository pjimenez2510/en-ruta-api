import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateRutaDto, UpdateRutaDto } from './dto';
import { RUTA_SELECT_WITH_RELATIONS } from './constants/ruta-select';

@Injectable()
export class RutasService {
  constructor(private prisma: PrismaService) {}

  async obtenerRutas(
    filtro: Prisma.RutaWhereInput,
    args: Prisma.RutaSelect = RUTA_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.ruta.findMany({
      where: filtro,
      orderBy: { nombre: 'asc' },
      select: args,
    });
  }

  async obtenerRuta(
    filtro: Prisma.RutaWhereUniqueInput,
    args: Prisma.RutaSelect = RUTA_SELECT_WITH_RELATIONS,
  ) {
    const ruta = await this.prisma.ruta.findUnique({
      where: filtro,
      select: args,
    });

    if (!ruta) {
      throw new NotFoundException(
        `Ruta con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return ruta;
  }

  async crearRuta(
    tenantId: number,
    datos: CreateRutaDto,
    tx?: Prisma.TransactionClient,
  ) {
    const existente = await this.prisma.ruta.findUnique({
      where: {
        tenantId_nombre: {
          tenantId,
          nombre: datos.nombre,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una ruta con el nombre ${datos.nombre} en este tenant`,
      );
    }

    return await (tx || this.prisma).ruta.create({
      data: {
        tenantId,
        resolucionId: datos.resolucionId,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        activo: datos.activo ?? true,
      },
      select: RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarRuta(
    id: number,
    tenantId: number,
    datos: UpdateRutaDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerRuta({ id });

    if (datos.nombre) {
      const existente = await this.prisma.ruta.findFirst({
        where: {
          tenantId,
          nombre: datos.nombre,
          NOT: {
            id,
          },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe una ruta con el nombre ${datos.nombre} en este tenant`,
        );
      }
    }

    return await (tx || this.prisma).ruta.update({
      where: { id },
      data: datos,
      select: RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async desactivarRuta(
    id: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerRuta({ id });

    return await (tx || this.prisma).ruta.update({
      where: { id },
      data: { activo: false },
      select: RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async activarRuta(
    id: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerRuta({ id });

    return await (tx || this.prisma).ruta.update({
      where: { id },
      data: { activo: true },
      select: RUTA_SELECT_WITH_RELATIONS,
    });
  }
} 