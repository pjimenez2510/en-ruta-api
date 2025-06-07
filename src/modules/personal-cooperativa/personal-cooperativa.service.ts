import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RolUsuario } from '@prisma/client';
import {
  CreatePersonalCooperativaDto,
  UpdatePersonalCooperativaDto,
} from './dto';
import { PERSONAL_COOPERATIVA_SELECT } from './constants/personal-cooperativa-select';

@Injectable()
export class PersonalCooperativaService {
  constructor(private prisma: PrismaService) {}

  async obtenerPersonalCooperativa({
    filtro,
    args = PERSONAL_COOPERATIVA_SELECT,
    tx,
  }: {
    filtro: Prisma.PersonalCooperativaWhereInput;
    args?: Prisma.PersonalCooperativaSelect;
    tx?: Prisma.TransactionClient;
  }) {
    return await (tx || this.prisma).personalCooperativa.findMany({
      where: filtro,
      orderBy: { apellidos: 'asc' },
      select: args,
    });
  }

  async obtenerPersonalCooperativaPorId({
    id,
    args = PERSONAL_COOPERATIVA_SELECT,
    tx,
  }: {
    id: number;
    args?: Prisma.PersonalCooperativaSelect;
    tx?: Prisma.TransactionClient;
  }) {
    const personal = await (tx || this.prisma).personalCooperativa.findUnique({
      where: { id },
      select: args,
    });

    if (!personal) {
      throw new NotFoundException(`Personal con ID ${id} no encontrado`);
    }

    return personal;
  }

  async obtenerPersonalPorUsuarioTenant(
    usuarioTenantId: number,
    args: Prisma.PersonalCooperativaSelect = PERSONAL_COOPERATIVA_SELECT,
  ) {
    const personal = await this.prisma.personalCooperativa.findUnique({
      where: { usuarioTenantId },
      select: args,
    });

    if (!personal) {
      throw new NotFoundException(
        `Personal con usuario-tenant ID ${usuarioTenantId} no encontrado`,
      );
    }

    return personal;
  }

  async crearPersonalCooperativa(
    datos: CreatePersonalCooperativaDto,
    usuarioTenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const usuarioTenant = await (tx || this.prisma).usuarioTenant.findUnique({
      where: { id: usuarioTenantId },
    });

    if (!usuarioTenant) {
      throw new NotFoundException(
        `Usuario-Tenant con ID ${usuarioTenantId} no encontrado`,
      );
    }

    const existente = await (tx || this.prisma).personalCooperativa.findUnique({
      where: { usuarioTenantId },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe información personal para el usuario-tenant con ID ${usuarioTenantId}`,
      );
    }

    this.validarDatosSegunRol(datos, usuarioTenant.rol);

    return await (tx || this.prisma).personalCooperativa.create({
      data: {
        ...datos,
        usuarioTenantId,
      },
      select: PERSONAL_COOPERATIVA_SELECT,
    });
  }

  async actualizarPersonalCooperativa(
    id: number,
    datos: UpdatePersonalCooperativaDto,
    rol: RolUsuario,
    tx?: Prisma.TransactionClient,
  ) {
    const personal = await this.obtenerPersonalCooperativaPorId({
      id,
      tx,
    });

    this.validarDatosSegunRol(datos, rol);

    return await (tx || this.prisma).personalCooperativa.update({
      where: { id },
      data: datos,
      select: PERSONAL_COOPERATIVA_SELECT,
    });
  }

  async desactivarPersonalCooperativa(
    id: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerPersonalCooperativaPorId({
      id,
      tx,
    });

    return await (tx || this.prisma).personalCooperativa.update({
      where: { id },
      data: { activo: false },
      select: PERSONAL_COOPERATIVA_SELECT,
    });
  }

  private validarDatosSegunRol(
    datos: CreatePersonalCooperativaDto | UpdatePersonalCooperativaDto,
    rol: RolUsuario,
  ) {
    if (rol === RolUsuario.CONDUCTOR) {
      if (!datos.licenciaConducir.trim()) {
        throw new BadRequestException(
          'El número de licencia de conducir es requerido para conductores',
        );
      }

      if (!datos.tipoLicencia.trim()) {
        throw new BadRequestException(
          'El tipo de licencia es requerido para conductores',
        );
      }

      if (!datos.fechaExpiracionLicencia) {
        throw new BadRequestException(
          'La fecha de expiración de la licencia es requerida para conductores',
        );
      }
    }
  }
}
