import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario, TipoUsuario, RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegistroClienteDto, RegistroCooperativaDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validarUsuario(email: string, password: string): Promise<any> {
    const usuario = await this.usuariosService.validarCredenciales(
      email,
      password,
    );
    if (!usuario) {
      return null;
    }
    return usuario;
  }

  async login(usuario: Usuario) {
    const payload = await this.crearPayload(usuario);
    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        tenant: payload.tenant,
        roles: payload.roles,
      },
    };
  }

  async registrarCliente(registroClienteDto: RegistroClienteDto) {
    const { email, password, cliente } = registroClienteDto;

    const usuario = await this.usuariosService.crearUsuario(
      email,
      password,
      TipoUsuario.CLIENTE,
    );

    await this.prisma.cliente.create({
      data: {
        ...cliente,
      },
    });

    return this.login(usuario);
  }

  async registrarUsuarioConTenant(registroUsuarioDto: RegistroCooperativaDto) {
    const { email, password, tenant } = registroUsuarioDto;

    const usuario = await this.usuariosService.crearUsuario(
      email,
      password,
      TipoUsuario.PERSONAL_COOPERATIVA,
    );

    const tenantNew = await this.prisma.tenant.create({
      data: {
        ...tenant,
      },
    });

    await this.prisma.usuarioTenant.create({
      data: {
        usuarioId: usuario.id,
        tenantId: tenantNew.id,
        rol: RolUsuario.ADMIN_COOPERATIVA,
      },
    });

    return this.login(usuario);
  }

  async cambiarTenant(usuarioId: number, tenantId: number) {
    const usuarioTenant = await this.prisma.usuarioTenant.findFirst({
      where: {
        usuarioId,
        tenantId,
        activo: true,
      },
    });

    if (!usuarioTenant) {
      throw new UnauthorizedException('No tienes acceso a este tenant');
    }

    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    return this.login(usuario);
  }

  private async crearPayload(usuario: Usuario) {
    const payload: any = {
      sub: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    };

    if (usuario.tipoUsuario === TipoUsuario.CLIENTE) {
      return payload;
    }

    const usuarioTenant = await this.prisma.usuarioTenant.findFirst({
      where: {
        usuarioId: usuario.id,
        activo: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            nombre: true,
            identificador: true,
          },
        },
      },
    });

    if (!usuarioTenant) {
      return payload;
    }

    payload.tenant = {
      id: usuarioTenant.tenant.id,
      nombre: usuarioTenant.tenant.nombre,
      identificador: usuarioTenant.tenant.identificador,
    };

    payload.roles = [usuarioTenant.rol];

    return payload;
  }
}
