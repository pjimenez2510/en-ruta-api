import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignTenantDto } from './dto/assign-tenant.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolUsuario, TipoUsuario } from '../../common/enums/user.enum';

@ApiTags('usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filtrar por estado activo/inactivo',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: TipoUsuario,
    description: 'Filtrar por tipo de usuario',
  })
  findAll(@Query('active') active?: string, @Query('type') type?: TipoUsuario) {
    const query: any = {};

    if (active !== undefined) {
      query.active = active === 'true';
    }

    if (type) {
      query.type = type;
    }

    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Obtener un usuario por email' })
  @ApiParam({ name: 'email', description: 'Email del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario a actualizar' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario (marcar como inactivo)' })
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/tenants')
  @ApiOperation({
    summary: 'Asignar un usuario a un tenant (cooperativa) con un rol',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 201, description: 'Usuario asignado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o asignación duplicada',
  })
  @ApiResponse({ status: 404, description: 'Usuario o tenant no encontrado' })
  assignToTenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignTenantDto: AssignTenantDto,
  ) {
    return this.usersService.assignToTenant(id, assignTenantDto);
  }
  @Delete(':id/tenants/:tenantId/roles/:rol')
  @ApiOperation({
    summary:
      'Eliminar asignación de un usuario a un tenant con un rol específico',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiParam({ name: 'tenantId', description: 'ID del tenant' })
  @ApiParam({ name: 'rol', description: 'Rol del usuario en el tenant' })
  @ApiResponse({
    status: 200,
    description: 'Asignación eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  removeFromTenant(
    @Param('id', ParseIntPipe) id: number,
    @Param('tenantId', ParseIntPipe) tenantId: number,
    @Param('rol') rol: RolUsuario,
  ) {
    return this.usersService.removeFromTenant(id, tenantId, rol);
  }
}
