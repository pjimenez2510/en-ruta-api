import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTipoAsientoDto, UpdateTipoAsientoDto } from './dto';
import { TIPO_ASIENTO_SELECT_WITH_RELATIONS } from './constants/tipo-asientos-select';

@Injectable()
export class TipoAsientosService {
  constructor(private prisma: PrismaService) {}

  async obtenerTiposAsiento(
    filtro: Prisma.TipoAsientoWhereInput,
    args: Prisma.TipoAsientoSelect = TIPO_ASIENTO_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.tipoAsiento.findMany({
      where: filtro,
      orderBy: { nombre: 'asc' },
      select: args,
    });
  }

  async obtenerTipoAsiento(
    filtro: Prisma.TipoAsientoWhereUniqueInput,
    args: Prisma.TipoAsientoSelect = TIPO_ASIENTO_SELECT_WITH_RELATIONS,
  ) {
    const tipoAsiento = await this.prisma.tipoAsiento.findUnique({
      where: filtro,
      select: args,
    });

    if (!tipoAsiento) {
      throw new NotFoundException(
        `Tipo de asiento con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return tipoAsiento;
  }

  async crearTipoAsiento(
    datos: CreateTipoAsientoDto,
    tx?: Prisma.TransactionClient,
  ) {
    // El tenantId es requerido
    if (!datos.tenantId) {
      throw new BadRequestException('El ID del tenant es requerido');
    }

    // Verificar que el tenant exista
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: datos.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con ID ${datos.tenantId} no encontrado`,
      );
    }

    // Verificar si ya existe un tipo de asiento con el mismo nombre para el tenant
    const existente = await this.prisma.tipoAsiento.findFirst({
      where: {
        nombre: datos.nombre,
        tenantId: datos.tenantId,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un tipo de asiento con el nombre ${datos.nombre} para el tenant ${datos.tenantId}`,
      );
    }

    return await (tx || this.prisma).tipoAsiento.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        factorPrecio: datos.factorPrecio,
        color: datos.color,
        icono: datos.icono,
        tenantId: datos.tenantId,
        activo: true,
      },
      select: TIPO_ASIENTO_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarTipoAsiento(
    id: number,
    datos: UpdateTipoAsientoDto,
    tx?: Prisma.TransactionClient,
  ) {
    const tipoAsiento = await this.obtenerTipoAsiento({ id });

    // Si se cambia el nombre, verificar que no exista otro con el mismo nombre para el tenant
    if (datos.nombre && datos.nombre !== tipoAsiento.nombre) {
      const existente = await this.prisma.tipoAsiento.findFirst({
        where: {
          nombre: datos.nombre,
          tenantId: tipoAsiento.tenantId,
          NOT: { id },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un tipo de asiento con el nombre ${datos.nombre} para el tenant ${tipoAsiento.tenantId}`,
        );
      }
    }

    return await (tx || this.prisma).tipoAsiento.update({
      where: { id },
      data: datos,
      select: TIPO_ASIENTO_SELECT_WITH_RELATIONS,
    });
  }

  async desactivarTipoAsiento(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerTipoAsiento({ id });

    // Verificar si hay asientos asociados a este tipo
    const asientosAsociados = await this.prisma.asiento.count({
      where: { tipoId: id },
    });

    if (asientosAsociados > 0) {
      // En lugar de eliminar, desactivar
      return await (tx || this.prisma).tipoAsiento.update({
        where: { id },
        data: { activo: false },
        select: TIPO_ASIENTO_SELECT_WITH_RELATIONS,
      });
    } else {
      // Si no hay asientos asociados, se puede eliminar
      return await (tx || this.prisma).tipoAsiento.delete({
        where: { id },
        select: TIPO_ASIENTO_SELECT_WITH_RELATIONS,
      });
    }
  }
}
