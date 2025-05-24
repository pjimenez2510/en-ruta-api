import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Put,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario } from '@prisma/client';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CrearUsuarioDto,
  ActualizarUsuarioDto,
  PerfilUsuarioDto,
  TenantUsuarioDto,
} from './dto';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil del usuario',
    type: PerfilUsuarioDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async obtenerPerfil(@UsuarioActual() usuario): Promise<PerfilUsuarioDto> {
    return usuario;
  }

  @ApiOperation({ summary: 'Obtener los tenants asociados a un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tenants asociados al usuario',
    type: [TenantUsuarioDto],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Get(':id/tenants')
  async obtenerTenantsDeUsuario(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TenantUsuarioDto[]> {
    return this.usuariosService.obtenerTenantsDeUsuario(id);
  }

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario creado correctamente',
    type: PerfilUsuarioDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos en la solicitud',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El correo electrónico ya está registrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  async crearUsuario(
    @Body() crearUsuarioDto: CrearUsuarioDto,
  ): Promise<PerfilUsuarioDto> {
    return this.usuariosService.crearUsuarioCompleto(crearUsuarioDto);
  }

  @ApiOperation({ summary: 'Actualizar un usuario existente' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario actualizado correctamente',
    type: PerfilUsuarioDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Patch(':id')
  async actualizarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() actualizarUsuarioDto: ActualizarUsuarioDto,
  ): Promise<PerfilUsuarioDto> {
    return this.usuariosService.actualizarUsuario(id, actualizarUsuarioDto);
  }
}
