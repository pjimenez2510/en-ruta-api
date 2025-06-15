import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateConfiguracionDescuentoDto, UpdateConfiguracionDescuentoDto, FiltroConfiguracionDescuentoDto } from './dto';
import { CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS } from './constants/configuracion-descuento-select';

@Injectable()
export class ConfiguracionDescuentosService {
  constructor(private prisma: PrismaService) {}

  async obtenerConfiguracionesDescuento(
    filtro: Prisma.ConfiguracionDescuentoWhereInput,
    args: Prisma.ConfiguracionDescuentoSelect = CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
    filtroDto?: FiltroConfiguracionDescuentoDto,
  ) {
    return await this.prisma.configuracionDescuento.findMany({
      where: filtro,
      orderBy: { tipo: 'asc' },
      select: args,
    });
  }

  async obtenerConfiguracionDescuento(
    filtro: Prisma.ConfiguracionDescuentoWhereUniqueInput,
    args: Prisma.ConfiguracionDescuentoSelect = CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
  ) {
    const configuracion = await this.prisma.configuracionDescuento.findUnique({
      where: filtro,
      select: args,
    });

    if (!configuracion) {
      throw new NotFoundException(
        `Configuración de descuento con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return configuracion;
  }

  async crearConfiguracionDescuento(
    datos: CreateConfiguracionDescuentoDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    // Verificar si ya existe una configuración para este tipo de descuento en el tenant
    const existente = await this.prisma.configuracionDescuento.findUnique({
      where: {
        tenantId_tipo: {
          tenantId,
          tipo: datos.tipo,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una configuración de descuento para el tipo '${datos.tipo}' en esta cooperativa`,
      );
    }

    return await (tx || this.prisma).configuracionDescuento.create({
      data: {
        tenantId,
        tipo: datos.tipo,
        porcentaje: datos.porcentaje,
        requiereValidacion: datos.requiereValidacion ?? true,
        activo: datos.activo ?? true,
      },
      select: CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarConfiguracionDescuento(
    id: number,
    datos: UpdateConfiguracionDescuentoDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerConfiguracionDescuento({ id, tenantId });

    // Si se está cambiando el tipo, verificar que no exista otra configuración con ese tipo
    if (datos.tipo) {
      const existente = await this.prisma.configuracionDescuento.findUnique({
        where: {
          tenantId_tipo: {
            tenantId,
            tipo: datos.tipo,
          },
        },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException(
          `Ya existe una configuración de descuento para el tipo '${datos.tipo}' en esta cooperativa`,
        );
      }
    }

    return await (tx || this.prisma).configuracionDescuento.update({
      where: { id },
      data: datos,
      select: CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
    });
  }

  async desactivarConfiguracionDescuento(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerConfiguracionDescuento({ id, tenantId });

    return await (tx || this.prisma).configuracionDescuento.update({
      where: { id },
      data: { activo: false },
      select: CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
    });
  }

  async activarConfiguracionDescuento(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerConfiguracionDescuento({ id, tenantId });

    return await (tx || this.prisma).configuracionDescuento.update({
      where: { id },
      data: { activo: true },
      select: CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarConfiguracionDescuento(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerConfiguracionDescuento({ id, tenantId });

    return await (tx || this.prisma).configuracionDescuento.delete({
      where: { id },
      select: CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
    });
  }

  // Método auxiliar para obtener configuración por tipo
  async obtenerConfiguracionPorTipo(
    tenantId: number,
    tipo: string,
    tx?: Prisma.TransactionClient,
  ) {
    const configuracion = await (tx || this.prisma).configuracionDescuento.findUnique({
      where: {
        tenantId_tipo: {
          tenantId,
          tipo: tipo as any,
        },
        activo: true,
      },
      select: CONFIGURACION_DESCUENTO_SELECT_WITH_RELATIONS,
    });

    if (!configuracion) {
      throw new NotFoundException(
        `No se encontró configuración activa para el descuento tipo '${tipo}' en esta cooperativa`,
      );
    }

    return configuracion;
  }
} 