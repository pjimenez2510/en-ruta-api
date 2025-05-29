import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUsuarioTenantDto, UpdateUsuarioTenantDto } from './dto';
import { USUARIO_TENANT_SELECT_WITH_RELATIONS } from './constants/usuario-tenant';

@Injectable()
export class UsuarioTenantService {
  constructor(private prisma: PrismaService) {}

  async obtenerUsuariosTenant(
    filtro: Prisma.UsuarioTenantWhereInput,
    args: Prisma.UsuarioTenantSelect = USUARIO_TENANT_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.usuarioTenant.findMany({
      where: filtro,
      orderBy: { fechaAsignacion: 'desc' },
      select: args,
    });
  }

  async obtenerUsuarioTenant(
    filtro: Prisma.UsuarioTenantWhereUniqueInput,
    args: Prisma.UsuarioTenantSelect = USUARIO_TENANT_SELECT_WITH_RELATIONS,
  ) {
    const usuarioTenant = await this.prisma.usuarioTenant.findUnique({
      where: filtro,
      select: args,
    });

    if (!usuarioTenant) {
      throw new NotFoundException(
        `Relación usuario-tenant con el filtro ${JSON.stringify(
          filtro,
        )} no encontrada`,
      );
    }

    return usuarioTenant;
  }

  async crearUsuarioTenant(
    datos: CreateUsuarioTenantDto,
    tx?: Prisma.TransactionClient,
  ) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: datos.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${datos.usuarioId} no encontrado`,
      );
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: datos.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con ID ${datos.tenantId} no encontrado`,
      );
    }

    const existente = await this.prisma.usuarioTenant.findFirst({
      where: {
        usuarioId: datos.usuarioId,
        tenantId: datos.tenantId,
        rol: datos.rol,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una relación para el usuario ${datos.usuarioId}, tenant ${datos.tenantId} y rol ${datos.rol}`,
      );
    }

    return await (tx || this.prisma).usuarioTenant.create({
      data: {
        usuarioId: datos.usuarioId,
        tenantId: datos.tenantId,
        rol: datos.rol,
        fechaAsignacion: new Date(),
        activo: datos.activo !== undefined ? datos.activo : true,
      },
      select: USUARIO_TENANT_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarUsuarioTenant(
    id: number,
    datos: UpdateUsuarioTenantDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerUsuarioTenant({ id });

    if (datos.rol) {
      const usuarioTenant = await this.prisma.usuarioTenant.findUnique({
        where: { id },
      });

      if (usuarioTenant) {
        const existente = await this.prisma.usuarioTenant.findFirst({
          where: {
            usuarioId: usuarioTenant.usuarioId,
            tenantId: usuarioTenant.tenantId,
            rol: datos.rol,
            NOT: [{ id }],
          },
        });

        if (existente) {
          throw new ConflictException(
            `Ya existe una relación para el usuario ${usuarioTenant.usuarioId}, tenant ${usuarioTenant.tenantId} y rol ${datos.rol}`,
          );
        }
      }
    }

    return await (tx || this.prisma).usuarioTenant.update({
      where: { id },
      data: datos,
      select: USUARIO_TENANT_SELECT_WITH_RELATIONS,
    });
  }

  async desactivarUsuarioTenant(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerUsuarioTenant({ id });

    return await (tx || this.prisma).usuarioTenant.update({
      where: { id },
      data: { activo: false },
      select: USUARIO_TENANT_SELECT_WITH_RELATIONS,
    });
  }
}
