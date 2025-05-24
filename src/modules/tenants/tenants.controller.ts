import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantResponseDto,
  AsignarUsuarioTenantDto,
  UsuarioTenantResponseDto,
} from './dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Obtener todos los tenants' })
  @ApiQuery({
    name: 'activos',
    required: false,
    type: Boolean,
    description: 'Filtrar solo tenants activos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants',
    type: [TenantResponseDto],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Get()
  async obtenerTenants(@Query('activos') activos: string = 'true') {
    const tenants = await this.tenantsService.obtenerTenants(
      activos === 'true',
    );
    return TenantResponseDto.fromEntities(tenants);
  }

  @ApiOperation({ summary: 'Obtener tenant por ID' })
  @ApiParam({ name: 'id', description: 'ID del tenant' })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerTenantPorId(@Param('id', ParseIntPipe) id: number) {
    const tenant = await this.tenantsService.obtenerTenantPorId(id);
    return TenantResponseDto.fromEntity(tenant);
  }

  @ApiOperation({ summary: 'Obtener tenant por identificador' })
  @ApiParam({
    name: 'identificador',
    description: 'Identificador único del tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant encontrado',
    type: TenantResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tenant no encontrado' })
  @Get('identificador/:identificador')
  async obtenerTenantPorIdentificador(
    @Param('identificador') identificador: string,
  ) {
    const tenant =
      await this.tenantsService.obtenerTenantPorIdentificador(identificador);
    return TenantResponseDto.fromEntity(tenant);
  }

  @ApiOperation({ summary: 'Crear nuevo tenant' })
  @ApiResponse({
    status: 201,
    description: 'Tenant creado correctamente',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o identificador duplicado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearTenant(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsService.crearTenant(createTenantDto);
    return TenantResponseDto.fromEntity(tenant);
  }

  @ApiOperation({ summary: 'Actualizar tenant' })
  @ApiParam({ name: 'id', description: 'ID del tenant a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Tenant actualizado correctamente',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant no encontrado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @RequireTenant()
  @Put(':id')
  async actualizarTenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto,
    @TenantActual() tenantActual,
    @UsuarioActual() usuario,
  ) {
    if (
      usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA &&
      tenantActual.id !== id
    ) {
      throw new Error('No tienes permisos para actualizar este tenant');
    }

    if (usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA) {
      delete updateTenantDto.activo;
    }

    const tenant = await this.tenantsService.actualizarTenant(
      id,
      updateTenantDto,
    );
    return TenantResponseDto.fromEntity(tenant);
  }

  @ApiOperation({ summary: 'Desactivar tenant' })
  @ApiParam({ name: 'id', description: 'ID del tenant a desactivar' })
  @ApiResponse({
    status: 200,
    description: 'Tenant desactivado correctamente',
    type: TenantResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant no encontrado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async desactivarTenant(@Param('id', ParseIntPipe) id: number) {
    const tenant = await this.tenantsService.desactivarTenant(id);
    return TenantResponseDto.fromEntity(tenant);
  }

  @ApiOperation({ summary: 'Obtener usuarios de un tenant' })
  @ApiParam({ name: 'id', description: 'ID del tenant' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios del tenant',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @RequireTenant()
  @Get(':id/usuarios')
  async obtenerUsuariosDeTenant(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
    @UsuarioActual() usuario,
  ) {
    if (
      usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA &&
      tenantActual.id !== id
    ) {
      throw new Error('No tienes permisos para ver usuarios de este tenant');
    }

    return this.tenantsService.obtenerUsuariosDeTenant(id);
  }

  @ApiOperation({ summary: 'Asignar usuario a tenant' })
  @ApiParam({ name: 'id', description: 'ID del tenant' })
  @ApiResponse({
    status: 200,
    description: 'Usuario asignado correctamente',
    type: UsuarioTenantResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @RequireTenant()
  @Post(':id/usuarios')
  async asignarUsuarioATenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() asignarUsuarioDto: AsignarUsuarioTenantDto,
    @TenantActual() tenantActual,
    @UsuarioActual() usuario,
  ) {
    if (
      usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA &&
      tenantActual.id !== id
    ) {
      throw new Error('No tienes permisos para asignar usuarios a este tenant');
    }

    if (
      usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA &&
      asignarUsuarioDto.rol === RolUsuario.ADMIN_COOPERATIVA
    ) {
      throw new Error('No tienes permisos para asignar rol de administrador');
    }

    return this.tenantsService.asignarUsuarioATenant(
      asignarUsuarioDto.usuarioId,
      id,
      asignarUsuarioDto.rol,
    );
  }

  @ApiOperation({ summary: 'Eliminar usuario de tenant' })
  @ApiParam({ name: 'id', description: 'ID del tenant' })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario' })
  @ApiParam({
    name: 'rol',
    description: 'Rol del usuario en el tenant',
    enum: RolUsuario,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado correctamente',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @RequireTenant()
  @Delete(':id/usuarios/:usuarioId/:rol')
  async eliminarUsuarioDeTenant(
    @Param('id', ParseIntPipe) id: number,
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('rol') rol: RolUsuario,
    @TenantActual() tenantActual,
    @UsuarioActual() usuario,
  ) {
    if (
      usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA &&
      tenantActual.id !== id
    ) {
      throw new Error(
        'No tienes permisos para eliminar usuarios de este tenant',
      );
    }

    if (
      usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA &&
      rol === RolUsuario.ADMIN_COOPERATIVA
    ) {
      throw new Error('No tienes permisos para eliminar administradores');
    }

    return this.tenantsService.eliminarUsuarioDeTenant(usuarioId, id, rol);
  }
}
