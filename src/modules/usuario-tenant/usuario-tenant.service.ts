import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RolUsuario, TipoUsuario } from '@prisma/client';
import { UpdateUsuarioTenantDto, CreateUsuarioTenantDto } from './dto';
import { USUARIO_TENANT_SELECT_WITH_RELATIONS } from './constants/usuario-tenant';
import { UsuariosService } from '../usuarios/usuarios.service';
import { PersonalCooperativaService } from '../personal-cooperativa/personal-cooperativa.service';
import { CreatePersonalCooperativaDto } from '../personal-cooperativa/dto';

@Injectable()
export class UsuarioTenantService {
  constructor(
    private prisma: PrismaService,
    private usuariosService: UsuariosService,
    private personalCooperativaService: PersonalCooperativaService,
  ) {}

  async obtenerUsuariosTenant({
    filtro,
    tx,
    args = USUARIO_TENANT_SELECT_WITH_RELATIONS,
  }: {
    filtro: Prisma.UsuarioTenantWhereInput;
    tx?: Prisma.TransactionClient;
    args?: Prisma.UsuarioTenantSelect;
  }) {
    return await (tx || this.prisma).usuarioTenant.findMany({
      where: filtro,
      orderBy: { fechaAsignacion: 'desc' },
      select: args,
    });
  }

  async obtenerUsuarioTenant({
    filtro,
    tx,
    args = USUARIO_TENANT_SELECT_WITH_RELATIONS,
  }: {
    filtro: Prisma.UsuarioTenantWhereUniqueInput;
    tx?: Prisma.TransactionClient;
    args?: Prisma.UsuarioTenantSelect;
  }) {
    const usuarioTenant = await (tx || this.prisma).usuarioTenant.findUnique({
      where: filtro,
      select: args,
    });

    if (!usuarioTenant) {
      throw new NotFoundException(
        `Relación usuario-tenant con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return usuarioTenant;
  }

  async crearUsuarioTenant(datos: CreateUsuarioTenantDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: datos.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant con ID ${datos.tenantId} no encontrado`,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const usuarioData = {
        ...datos.usuario,
        tipoUsuario: TipoUsuario.PERSONAL_COOPERATIVA,
      };

      const usuario = await this.usuariosService.crearUsuario(usuarioData, tx);

      const usuarioTenant = await tx.usuarioTenant.create({
        data: {
          usuarioId: usuario.id,
          tenantId: datos.tenantId,
          rol: datos.rol,
          fechaAsignacion: new Date(),
          activo: true,
        },
        select: USUARIO_TENANT_SELECT_WITH_RELATIONS,
      });

      await this.personalCooperativaService.crearPersonalCooperativa(
        datos.infoPersonal,
        usuarioTenant.id,
        tx,
      );

      return await this.obtenerUsuarioTenant({
        filtro: { id: usuarioTenant.id },
        tx,
      });
    });
  }

  async actualizarUsuarioTenant(id: number, datos: UpdateUsuarioTenantDto) {
    return await this.prisma.$transaction(async (tx) => {
      let usuarioTenant = await this.obtenerUsuarioTenant({
        filtro: { id },
        tx,
      });

      if (datos.rol) {
        usuarioTenant = await tx.usuarioTenant.update({
          where: { id },
          data: {
            rol: datos.rol,
          },
          select: USUARIO_TENANT_SELECT_WITH_RELATIONS,
        });
      }

      if (datos.usuario) {
        const usuarioData = {
          ...datos.usuario,
          tipoUsuario: TipoUsuario.PERSONAL_COOPERATIVA,
        };

        await this.usuariosService.actualizarUsuario(
          usuarioTenant.usuario.id,
          usuarioData,
          tx,
        );
      }

      if (datos.infoPersonal && usuarioTenant.infoPersonal) {
        await this.personalCooperativaService.actualizarPersonalCooperativa(
          usuarioTenant.infoPersonal.id,
          datos.infoPersonal,
          usuarioTenant.rol,
          tx,
        );
      }

      return this.obtenerUsuarioTenant({
        filtro: { id },
        tx,
      });
    });
  }

  async asignarPersonalCooperativa(
    idUsuarioTenant: number,
    datos: CreatePersonalCooperativaDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerUsuarioTenant({
      filtro: { id: idUsuarioTenant },
      tx,
      args: { id: true },
    });

    await this.personalCooperativaService.crearPersonalCooperativa(
      datos,
      idUsuarioTenant,
      tx,
    );

    return await this.obtenerUsuarioTenant({
      filtro: { id: idUsuarioTenant },
      tx,
    });
  }

  async desactivarUsuarioTenant(id: number) {
    await this.obtenerUsuarioTenant({
      filtro: { id },
      args: { id: true },
    });

    return await this.prisma.$transaction(async (tx) => {
      const usuarioTenant = await tx.usuarioTenant.update({
        where: { id },
        data: { activo: false },
        select: USUARIO_TENANT_SELECT_WITH_RELATIONS,
      });

      await this.personalCooperativaService.desactivarPersonalCooperativa(
        usuarioTenant.infoPersonal.id,
        tx,
      );

      await this.usuariosService.desactivarUsuario(
        usuarioTenant.usuario.id,
        tx,
      );

      return await this.obtenerUsuarioTenant({
        filtro: { id },
        tx,
      });
    });
  }
}
