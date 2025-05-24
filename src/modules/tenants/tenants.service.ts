import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tenant, RolUsuario, UsuarioTenant } from '@prisma/client';
import { CreateTenantDto, UpdateTenantDto } from './dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async obtenerTenants(activos: boolean = true): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      where: { activo: activos },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerTenantPorId(id: number): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant con ID ${id} no encontrado`);
    }

    return tenant;
  }

  async obtenerTenantPorIdentificador(identificador: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { identificador },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con identificador ${identificador} no encontrado`,
      );
    }

    return tenant;
  }

  async crearTenant(datos: CreateTenantDto): Promise<Tenant> {
    const existente = await this.prisma.tenant.findUnique({
      where: { identificador: datos.identificador },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un tenant con el identificador ${datos.identificador}`,
      );
    }

    return this.prisma.tenant.create({
      data: {
        ...datos,
        fechaRegistro: new Date(),
        activo: true,
      },
    });
  }

  async actualizarTenant(id: number, datos: UpdateTenantDto): Promise<Tenant> {
    await this.obtenerTenantPorId(id);

    if (datos.identificador) {
      const existente = await this.prisma.tenant.findUnique({
        where: { identificador: datos.identificador },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException(
          `Ya existe un tenant con el identificador ${datos.identificador}`,
        );
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: datos,
    });
  }

  async desactivarTenant(id: number): Promise<Tenant> {
    await this.obtenerTenantPorId(id);

    return this.prisma.tenant.update({
      where: { id },
      data: { activo: false },
    });
  }

  async obtenerUsuariosDeTenant(tenantId: number) {
    return this.prisma.usuarioTenant.findMany({
      where: { tenantId, activo: true },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            tipoUsuario: true,
            fechaRegistro: true,
            ultimoAcceso: true,
          },
        },
      },
    });
  }

  async asignarUsuarioATenant(
    usuarioId: number,
    tenantId: number,
    rol: RolUsuario,
  ): Promise<UsuarioTenant> {
    await this.obtenerTenantPorId(tenantId);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const existente = await this.prisma.usuarioTenant.findFirst({
      where: {
        usuarioId,
        tenantId,
        rol,
      },
    });

    if (existente) {
      if (!existente.activo) {
        return this.prisma.usuarioTenant.update({
          where: { id: existente.id },
          data: { activo: true },
        });
      }
      return existente;
    }

    return this.prisma.usuarioTenant.create({
      data: {
        usuarioId,
        tenantId,
        rol,
        fechaAsignacion: new Date(),
      },
    });
  }

  async eliminarUsuarioDeTenant(
    usuarioId: number,
    tenantId: number,
    rol: RolUsuario,
  ): Promise<UsuarioTenant> {
    const relacion = await this.prisma.usuarioTenant.findFirst({
      where: {
        usuarioId,
        tenantId,
        rol,
      },
    });

    if (!relacion) {
      throw new NotFoundException(`Relación no encontrada`);
    }

    return this.prisma.usuarioTenant.update({
      where: { id: relacion.id },
      data: { activo: false },
    });
  }
}
