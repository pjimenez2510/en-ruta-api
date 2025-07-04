import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Usuario, TipoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CrearUsuarioDto, ActualizarUsuarioDto, PerfilUsuarioDto } from './dto';
import {
  USUARIO_SELECT,
  USUARIO_SELECT_WITH_RELATIONS,
} from './constants/usuario-select';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async obtenerUsuarios(
    filtro: Prisma.UsuarioWhereInput,
    args: Prisma.UsuarioSelect = USUARIO_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.usuario.findMany({
      where: filtro,
      orderBy: { username: 'asc' },
      select: args,
    });
  }

  async obtenerUsuario(
    filtro: Prisma.UsuarioWhereUniqueInput,
    tx?: Prisma.TransactionClient,
    args: Prisma.UsuarioSelect = USUARIO_SELECT_WITH_RELATIONS,
  ) {
    const usuario = await (tx || this.prisma).usuario.findUnique({
      where: filtro,
      select: args,
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return usuario;
  }

  async crearUsuario(
    crearUsuarioDto: CrearUsuarioDto,
    tx?: Prisma.TransactionClient,
  ): Promise<Usuario> {
    const { username, password, tipoUsuario } = crearUsuarioDto;
    const passwordHash = await this.hashPassword(password);
    const usuarioExistente = await (tx || this.prisma).usuario.findUnique({
      where: { username },
    });
    if (usuarioExistente) {
      throw new ConflictException(
        `Ya existe un usuario con el username ${username}`,
      );
    }

    return await (tx || this.prisma).usuario.create({
      data: {
        username,
        passwordHash,
        tipoUsuario,
        fechaRegistro: new Date(),
        activo: true,
      },
      select: USUARIO_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarUsuario(
    id: number,
    actualizarUsuarioDto: ActualizarUsuarioDto,
    tx?: Prisma.TransactionClient,
  ): Promise<PerfilUsuarioDto> {
    const usuarioExistente = await this.obtenerUsuario({ id });

    if (
      actualizarUsuarioDto.username &&
      actualizarUsuarioDto.username !== usuarioExistente.username
    ) {
      const existente = await (tx || this.prisma).usuario.findUnique({
        where: { username: actualizarUsuarioDto.username, NOT: { id: id } },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un usuario con el username ${actualizarUsuarioDto.username}`,
        );
      }
    }
    return await (tx || this.prisma).usuario.update({
      where: { id },
      data: {
        username: actualizarUsuarioDto.username,
        tipoUsuario: actualizarUsuarioDto.tipoUsuario,
        activo: actualizarUsuarioDto.activo,

        passwordHash: actualizarUsuarioDto.password
          ? await this.hashPassword(actualizarUsuarioDto.password)
          : undefined,
      },
      select: USUARIO_SELECT_WITH_RELATIONS,
    });
  }

  async desactivarUsuario(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerUsuario({ id });

    return await (tx || this.prisma).usuario.update({
      where: { id },
      data: { activo: false },
      select: USUARIO_SELECT_WITH_RELATIONS,
    });
  }

  async validarCredenciales(
    username: string,
    password: string,
  ): Promise<Usuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { username },
      select: {
        ...USUARIO_SELECT_WITH_RELATIONS,
        passwordHash: true,
      },
    });
    if (!usuario) return null;

    console.log('usuario', usuario);

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const passwordValida = await this.validarPassword(
      password,
      usuario.passwordHash,
    );
    if (!passwordValida) return null;

    return usuario;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private async validarPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
