import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Usuario, TipoUsuario, RolUsuario, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegistroClienteDto, RegistroCooperativaDto } from './dto';
import { ClientesService } from '../clientes/clientes.service';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private clientesService: ClientesService,
    private tenantsService: TenantsService,
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
    const { passwordHash, ...usuarioWithoutPassword } = usuario;
    return {
      accessToken: this.jwtService.sign(usuarioWithoutPassword),
      usuario: usuarioWithoutPassword,
    };
  }

  async registrarCliente(registroClienteDto: RegistroClienteDto) {
    const { email, password, cliente } = registroClienteDto;

    return this.prisma.$transaction(async (tx) => {
      const usuario = await this.usuariosService.crearUsuario(
        {
          email,
          password,
          tipoUsuario: TipoUsuario.CLIENTE,
        },
        tx,
      );

      await this.clientesService.crearCliente(cliente, tx, usuario.id);

      const usuarioTenant = await this.usuariosService.obtenerUsuario(
        {
          id: usuario.id,
        },
        tx,
      );

      return this.login(usuarioTenant);
    });
  }

  async registrarUsuarioConTenant(registroUsuarioDto: RegistroCooperativaDto) {
    const { email, password, tenant } = registroUsuarioDto;

    return this.prisma.$transaction(async (tx) => {
      const usuario = await this.usuariosService.crearUsuario(
        {
          email,
          password,
          tipoUsuario: TipoUsuario.PERSONAL_COOPERATIVA,
        },
        tx,
      );

      const tenantNew = await this.tenantsService.crearTenant(tenant, tx);

      await tx.usuarioTenant.create({
        data: {
          usuarioId: usuario.id,
          tenantId: tenantNew.id,
          rol: RolUsuario.ADMIN_COOPERATIVA,
        },
      });

      const usuarioTenant = await this.usuariosService.obtenerUsuario(
        {
          id: usuario.id,
        },
        tx,
      );

      return this.login(usuarioTenant);
    });
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

    const usuario = await this.usuariosService.obtenerUsuario({
      id: usuarioId,
    });
    return this.login(usuario);
  }
}
