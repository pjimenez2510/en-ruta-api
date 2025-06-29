import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTipoRutaBusDto, UpdateTipoRutaBusDto } from './dto';
import { TIPO_RUTA_BUS_SELECT_WITH_RELATIONS } from './constants/tipo-ruta-bus-select';

@Injectable()
export class TiposRutaBusService {
  constructor(private prisma: PrismaService) {}

  async obtenerTiposRutaBus(
    filtro: Prisma.TipoRutaBusWhereInput,
    args: Prisma.TipoRutaBusSelect = TIPO_RUTA_BUS_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.tipoRutaBus.findMany({
      where: filtro,
      orderBy: { nombre: 'asc' },
      select: args,
    });
  }

  async obtenerTipoRutaBus(
    filtro: Prisma.TipoRutaBusWhereUniqueInput,
    args: Prisma.TipoRutaBusSelect = TIPO_RUTA_BUS_SELECT_WITH_RELATIONS,
  ) {
    const tipoRutaBus = await this.prisma.tipoRutaBus.findUnique({
      where: filtro,
      select: args,
    });

    if (!tipoRutaBus) {
      throw new NotFoundException(
        `Tipo de ruta de bus con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return tipoRutaBus;
  }

  async crearTipoRutaBus(
    tenantId: number,
    datos: CreateTipoRutaBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    const existente = await this.prisma.tipoRutaBus.findFirst({
      where: {
        tenantId,
        nombre: datos.nombre,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un tipo de ruta de bus con el nombre ${datos.nombre} en este tenant`,
      );
    }

    return await (tx || this.prisma).tipoRutaBus.create({
      data: {
        tenantId,
        nombre: datos.nombre,
      },
      select: TIPO_RUTA_BUS_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarTipoRutaBus(
    id: number,
    tenantId: number,
    datos: UpdateTipoRutaBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerTipoRutaBus({ id });

    if (datos.nombre) {
      const existente = await this.prisma.tipoRutaBus.findFirst({
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
          `Ya existe un tipo de ruta de bus con el nombre ${datos.nombre} en este tenant`,
        );
      }
    }

    return await (tx || this.prisma).tipoRutaBus.update({
      where: { id },
      data: datos,
      select: TIPO_RUTA_BUS_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarTipoRutaBus(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const tipoRutaBus = await this.obtenerTipoRutaBus({ id });

    if (tipoRutaBus.tenantId !== tenantId) {
      throw new NotFoundException(
        `El tipo de ruta de bus con ID ${id} no pertenece al tenant ${tenantId}`,
      );
    }

    // Verificar si hay buses asociados
    const busesAsociados = await this.prisma.bus.count({
      where: { tipoRutaBusId: id },
    });

    if (busesAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de ruta de bus porque tiene ${busesAsociados} bus(es) asociado(s)`,
      );
    }

    // Verificar si hay rutas asociadas
    const rutasAsociadas = await this.prisma.ruta.count({
      where: { tipoRutaBusId: id },
    });

    if (rutasAsociadas > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de ruta de bus porque tiene ${rutasAsociadas} ruta(s) asociada(s)`,
      );
    }

    return await (tx || this.prisma).tipoRutaBus.delete({
      where: { id },
      select: TIPO_RUTA_BUS_SELECT_WITH_RELATIONS,
    });
  }
} 