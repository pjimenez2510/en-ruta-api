import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMetodoPagoDto, UpdateMetodoPagoDto, FiltroMetodoPagoDto } from './dto';
import { METODO_PAGO_SELECT_WITH_RELATIONS } from './constants/metodo-pago-select';

@Injectable()
export class MetodosPagoService {
  constructor(private prisma: PrismaService) {}

  async obtenerMetodosPago(
    filtro: Prisma.MetodoPagoWhereInput,
    args: Prisma.MetodoPagoSelect = METODO_PAGO_SELECT_WITH_RELATIONS,
    filtroDto?: FiltroMetodoPagoDto,
  ) {
    return await this.prisma.metodoPago.findMany({
      where: filtro,
      orderBy: { nombre: 'asc' },
      select: args,
    });
  }

  async obtenerMetodoPago(
    filtro: Prisma.MetodoPagoWhereUniqueInput,
    args: Prisma.MetodoPagoSelect = METODO_PAGO_SELECT_WITH_RELATIONS,
  ) {
    const metodoPago = await this.prisma.metodoPago.findUnique({
      where: filtro,
      select: args,
    });

    if (!metodoPago) {
      throw new NotFoundException(
        `Método de pago con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return metodoPago;
  }

  async crearMetodoPago(
    datos: CreateMetodoPagoDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    // Verificar si ya existe un método de pago con el mismo nombre en el tenant
    const existente = await this.prisma.metodoPago.findFirst({
      where: {
        tenantId,
        nombre: datos.nombre,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un método de pago con el nombre '${datos.nombre}' en esta cooperativa`,
      );
    }

    return await (tx || this.prisma).metodoPago.create({
      data: {
        tenantId,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        procesador: datos.procesador,
        configuracion: datos.configuracion,
        activo: datos.activo ?? true,
      },
      select: METODO_PAGO_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarMetodoPago(
    id: number,
    datos: UpdateMetodoPagoDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerMetodoPago({ id, tenantId });

    // Verificar si el nuevo nombre ya existe en otro método de pago del mismo tenant
    if (datos.nombre) {
      const existente = await this.prisma.metodoPago.findFirst({
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
          `Ya existe un método de pago con el nombre '${datos.nombre}' en esta cooperativa`,
        );
      }
    }

    return await (tx || this.prisma).metodoPago.update({
      where: { id },
      data: datos,
      select: METODO_PAGO_SELECT_WITH_RELATIONS,
    });
  }

  async desactivarMetodoPago(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerMetodoPago({ id, tenantId });

    return await (tx || this.prisma).metodoPago.update({
      where: { id },
      data: { activo: false },
      select: METODO_PAGO_SELECT_WITH_RELATIONS,
    });
  }

  async activarMetodoPago(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerMetodoPago({ id, tenantId });

    return await (tx || this.prisma).metodoPago.update({
      where: { id },
      data: { activo: true },
      select: METODO_PAGO_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarMetodoPago(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerMetodoPago({ id, tenantId });

    // Verificar si el método de pago tiene ventas asociadas
    const ventasAsociadas = await this.prisma.venta.count({
      where: { metodoPagoId: id },
    });

    if (ventasAsociadas > 0) {
      throw new ConflictException(
        `No se puede eliminar el método de pago porque tiene ${ventasAsociadas} venta(s) asociada(s)`,
      );
    }

    return await (tx || this.prisma).metodoPago.delete({
      where: { id },
      select: METODO_PAGO_SELECT_WITH_RELATIONS,
    });
  }
} 