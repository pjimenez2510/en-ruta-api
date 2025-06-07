import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Put,
  Delete,
  HttpCode,
  Query,
  Body,
  Post,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario } from '@prisma/client';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  ActualizarUsuarioDto,
  PerfilUsuarioDto,
  FiltroUsuarioDto,
  CrearUsuarioDto,
} from './dto';
import { filtroUsuarioBuild } from './utils/filtro-usuario-build';

@ApiTags('usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  async crearUsuario(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crearUsuario(crearUsuarioDto);
  }

  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Get()
  async obtenerUsuarios(@Query() filtro: FiltroUsuarioDto) {
    const usuarios = await this.usuariosService.obtenerUsuarios(
      filtroUsuarioBuild(filtro),
    );
    return usuarios;
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Get(':id')
  async obtenerUsuarioPorId(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.obtenerUsuario({ id });
    return usuario;
  }

  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async obtenerPerfil(@UsuarioActual() usuario): Promise<PerfilUsuarioDto> {
    return usuario;
  }

  @ApiOperation({ summary: 'Actualizar un usuario existente' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id')
  async actualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
  ): Promise<PerfilUsuarioDto> {
    return this.usuariosService.actualizarUsuario(id, actualizarUsuarioDto);
  }

  @ApiOperation({ summary: 'Desactivar un usuario' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async desactivarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.desactivarUsuario(id);
  }
}
