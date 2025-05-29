import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TipoConfiguracion } from '@prisma/client';
import {
  CreateConfiguracionesTenantDto,
  UpdateConfiguracionesTenantDto,
} from './dto';
import { CONFIGURACIONES_TENANT_SELECT_WITH_RELATIONS } from './constants/configuraciones-tenant-select';

@Injectable()
export class ConfiguracionesTenantService {
  constructor(private prisma: PrismaService) {}

  async obtenerConfiguraciones(
    filtro: Prisma.ConfiguracionWhereInput,
    args: Prisma.ConfiguracionSelect = CONFIGURACIONES_TENANT_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.configuracion.findMany({
      where: filtro,
      orderBy: { clave: 'asc' },
      select: args,
    });
  }

  async obtenerConfiguracion(
    filtro: Prisma.ConfiguracionWhereUniqueInput,
    args: Prisma.ConfiguracionSelect = CONFIGURACIONES_TENANT_SELECT_WITH_RELATIONS,
  ) {
    const configuracion = await this.prisma.configuracion.findUnique({
      where: filtro,
      select: args,
    });

    if (!configuracion) {
      throw new NotFoundException(
        `Configuración con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return configuracion;
  }

  async crearConfiguracion(
    datos: CreateConfiguracionesTenantDto,
    tx?: Prisma.TransactionClient,
  ) {
    // Verificar que el tenant exista
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: datos.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con ID ${datos.tenantId} no encontrado`,
      );
    }

    // Verificar si ya existe una configuración con la misma clave para el tenant
    const existente = await this.prisma.configuracion.findUnique({
      where: {
        tenantId_clave: {
          tenantId: datos.tenantId,
          clave: datos.clave,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una configuración con la clave ${datos.clave} para el tenant ${datos.tenantId}`,
      );
    }

    // Preparar el valor según el tipo
    let valor = datos.valor;

    if (
      datos.tipo === TipoConfiguracion.NUMERO &&
      datos.numeroValor !== undefined
    ) {
      valor = datos.numeroValor.toString();
    } else if (
      datos.tipo === TipoConfiguracion.BOOLEANO &&
      datos.booleanoValor !== undefined
    ) {
      valor = datos.booleanoValor.toString();
    } else if (datos.tipo === TipoConfiguracion.JSON && datos.jsonValor) {
      valor = datos.jsonValor;
    }

    return await (tx || this.prisma).configuracion.create({
      data: {
        clave: datos.clave,
        valor,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        tenantId: datos.tenantId,
        fechaModificacion: new Date(),
      },
      select: CONFIGURACIONES_TENANT_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarConfiguracion(
    id: number,
    datos: UpdateConfiguracionesTenantDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerConfiguracion({ id });

    // Si se cambia la clave, verificar que no exista otra configuración con la misma clave para el tenant
    if (datos.clave && datos.tenantId) {
      const existente = await this.prisma.configuracion.findFirst({
        where: {
          tenantId: datos.tenantId,
          clave: datos.clave,
          NOT: [{ id }],
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe una configuración con la clave ${datos.clave} para el tenant ${datos.tenantId}`,
        );
      }
    }

    // Preparar el valor según el tipo
    let valor = datos.valor;

    if (
      datos.tipo === TipoConfiguracion.NUMERO &&
      datos.numeroValor !== undefined
    ) {
      valor = datos.numeroValor.toString();
    } else if (
      datos.tipo === TipoConfiguracion.BOOLEANO &&
      datos.booleanoValor !== undefined
    ) {
      valor = datos.booleanoValor.toString();
    } else if (datos.tipo === TipoConfiguracion.JSON && datos.jsonValor) {
      valor = datos.jsonValor;
    }

    return await (tx || this.prisma).configuracion.update({
      where: { id },
      data: {
        ...(datos.clave && { clave: datos.clave }),
        ...(valor !== undefined && { valor }),
        ...(datos.tipo && { tipo: datos.tipo }),
        ...(datos.descripcion !== undefined && {
          descripcion: datos.descripcion,
        }),
        fechaModificacion: new Date(),
      },
      select: CONFIGURACIONES_TENANT_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarConfiguracion(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerConfiguracion({ id });

    return await (tx || this.prisma).configuracion.delete({
      where: { id },
      select: CONFIGURACIONES_TENANT_SELECT_WITH_RELATIONS,
    });
  }
}
