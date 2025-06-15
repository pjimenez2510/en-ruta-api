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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
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

  @ApiOperation(
    CommonDescriptions.create('usuario', [TipoUsuario.ADMIN_SISTEMA], 
    'Crea un nuevo usuario en el sistema. Solo administradores del sistema pueden crear usuarios. Requiere información básica como email, contraseña y tipo de usuario.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  async crearUsuario(@Body() crearUsuarioDto: CrearUsuarioDto) {
    return this.usuariosService.crearUsuario(crearUsuarioDto);
  }

  @ApiOperation(
    CommonDescriptions.getAll('usuarios', [TipoUsuario.ADMIN_SISTEMA], 
    'Lista todos los usuarios del sistema con filtros por tipo, estado, email, etc. Solo administradores del sistema pueden ver la lista completa de usuarios.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Get()
  async obtenerUsuarios(@Query() filtro: FiltroUsuarioDto) {
    const usuarios = await this.usuariosService.obtenerUsuarios(
      filtroUsuarioBuild(filtro),
    );
    return usuarios;
  }

  @ApiOperation(
    CommonDescriptions.getById('usuario', [TipoUsuario.ADMIN_SISTEMA], 
    'Obtiene los detalles completos de un usuario específico por su ID. Solo administradores del sistema pueden ver información de cualquier usuario.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Get(':id')
  async obtenerUsuarioPorId(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usuariosService.obtenerUsuario({ id });
    return usuario;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener perfil del usuario autenticado',
      description: 'Obtiene la información del perfil del usuario actualmente autenticado. Cualquier usuario puede ver su propio perfil.',
      roles: [TipoUsuario.ADMIN_SISTEMA, TipoUsuario.CLIENTE, TipoUsuario.PERSONAL_COOPERATIVA],
    })
  )
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async obtenerPerfil(@UsuarioActual() usuario): Promise<PerfilUsuarioDto> {
    return usuario;
  }

  @ApiOperation(
    CommonDescriptions.update('usuario', [TipoUsuario.ADMIN_SISTEMA], 
    'Actualiza la información de un usuario existente como email, estado o tipo. Solo administradores del sistema pueden actualizar usuarios.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id')
  async actualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
  ): Promise<PerfilUsuarioDto> {
    return this.usuariosService.actualizarUsuario(id, actualizarUsuarioDto);
  }

  @ApiOperation(
    CommonDescriptions.delete('usuario', [TipoUsuario.ADMIN_SISTEMA], 
    'Desactiva un usuario del sistema. El usuario no se elimina físicamente sino que se marca como inactivo. Solo administradores del sistema pueden desactivar usuarios.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async desactivarUsuario(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.desactivarUsuario(id);
  }
}
