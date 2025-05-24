import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Usuario, TipoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CrearUsuarioDto, ActualizarUsuarioDto, PerfilUsuarioDto } from './dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async crearUsuario(
    email: string,
    password: string,
    tipoUsuario: TipoUsuario = TipoUsuario.CLIENTE,
  ): Promise<Usuario> {
    const passwordHash = await this.hashPassword(password);

    return this.prisma.usuario.create({
      data: {
        email,
        passwordHash,
        tipoUsuario,
        fechaRegistro: new Date(),
        activo: true,
      },
    });
  }

  async crearUsuarioCompleto(
    crearUsuarioDto: CrearUsuarioDto,
  ): Promise<PerfilUsuarioDto> {
    const usuarioExistente = await this.buscarPorEmail(crearUsuarioDto.email);
    if (usuarioExistente) {
      throw new ConflictException(
        `Ya existe un usuario con el email ${crearUsuarioDto.email}`,
      );
    }

    const usuario = await this.crearUsuario(
      crearUsuarioDto.email,
      crearUsuarioDto.password,
      crearUsuarioDto.tipoUsuario || TipoUsuario.CLIENTE,
    );

    return {
      id: usuario.id,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      fechaRegistro: usuario.fechaRegistro,
      ultimoAcceso: usuario.ultimoAcceso,
      activo: usuario.activo,
      tenant: null,
      roles: null,
    };
  }

  async actualizarUsuario(
    id: number,
    actualizarUsuarioDto: ActualizarUsuarioDto,
  ): Promise<PerfilUsuarioDto> {
    const usuarioExistente = await this.buscarPorId(id);
    if (!usuarioExistente) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const datosActualizacion: any = { ...actualizarUsuarioDto };

    if (actualizarUsuarioDto.password) {
      datosActualizacion.passwordHash = await this.hashPassword(
        actualizarUsuarioDto.password,
      );
      delete datosActualizacion.password;
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id },
      data: datosActualizacion,
    });

    return {
      id: usuarioActualizado.id,
      email: usuarioActualizado.email,
      tipoUsuario: usuarioActualizado.tipoUsuario,
      fechaRegistro: usuarioActualizado.fechaRegistro,
      ultimoAcceso: usuarioActualizado.ultimoAcceso,
      activo: usuarioActualizado.activo,
      tenant: null,
      roles: null,
    };
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  async validarCredenciales(
    email: string,
    password: string,
  ): Promise<Usuario | null> {
    const usuario = await this.buscarPorEmail(email);
    if (!usuario) return null;

    const passwordValida = await this.validarPassword(
      password,
      usuario.passwordHash,
    );
    if (!passwordValida) return null;

    return usuario;
  }

  async obtenerTenantsDeUsuario(usuarioId: number) {
    return this.prisma.usuarioTenant.findMany({
      where: { usuarioId, activo: true },
      include: {
        tenant: true,
      },
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async validarPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
