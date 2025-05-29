import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { TENANT_SELECT } from './constants/tenant-select';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async obtenerTenants(
    filtro: Prisma.TenantWhereInput,
    args: Prisma.TenantSelect = TENANT_SELECT,
  ) {
    return await this.prisma.tenant.findMany({
      where: filtro,
      orderBy: { nombre: 'asc' },
      select: args,
    });
  }

  async obtenerTenant(
    filtro: Prisma.TenantWhereUniqueInput,
    args: Prisma.TenantSelect = TENANT_SELECT,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: filtro,
      select: args,
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return tenant;
  }

  async crearTenant(datos: CreateTenantDto, tx?: Prisma.TransactionClient) {
    const existente = await this.prisma.tenant.findUnique({
      where: { identificador: datos.identificador },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un tenant con el identificador ${datos.identificador}`,
      );
    }

    return await (tx || this.prisma).tenant.create({
      data: {
        ...datos,
        fechaRegistro: new Date(),
        activo: true,
      },
    });
  }

  async actualizarTenant(
    id: number,
    datos: UpdateTenantDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerTenant({ id });

    if (datos.identificador) {
      const existente = await this.prisma.tenant.findUnique({
        where: {
          identificador: datos.identificador,
          NOT: [{ id: id }],
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un tenant con el identificador ${datos.identificador}`,
        );
      }
    }

    return await (tx || this.prisma).tenant.update({
      where: { id },
      data: datos,
      select: TENANT_SELECT,
    });
  }

  async desactivarTenant(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerTenant({ id });

    return await (tx || this.prisma).tenant.update({
      where: { id },
      data: { activo: false },
      select: TENANT_SELECT,
    });
  }
}
