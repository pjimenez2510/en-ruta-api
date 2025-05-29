import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsuarioTenantService } from './usuario-tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateUsuarioTenantDto,
  UpdateUsuarioTenantDto,
  FiltroUsuarioTenantDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroUsuarioTenantBuild } from './utils/filtro-usuario-tenant-build';

@ApiTags('usuario-tenant')
@ApiBearerAuth()
@Controller('usuario-tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioTenantController {
  constructor(private readonly usuarioTenantService: UsuarioTenantService) {}

  @ApiOperation({ summary: 'Obtener todas las relaciones usuario-tenant' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get()
  async obtenerUsuariosTenant(@Query() filtro: FiltroUsuarioTenantDto) {
    const usuariosTenant =
      await this.usuarioTenantService.obtenerUsuariosTenant(
        filtroUsuarioTenantBuild(filtro),
      );
    return usuariosTenant;
  }

  @ApiOperation({ summary: 'Obtener una relación usuario-tenant por ID' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerUsuarioTenantPorId(@Param('id', ParseIntPipe) id: number) {
    const usuarioTenant = await this.usuarioTenantService.obtenerUsuarioTenant({
      id,
    });
    return usuarioTenant;
  }

  @ApiOperation({ summary: 'Crear una nueva relación usuario-tenant' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearUsuarioTenant(
    @Body() createUsuarioTenantDto: CreateUsuarioTenantDto,
  ) {
    const usuarioTenant = await this.usuarioTenantService.crearUsuarioTenant(
      createUsuarioTenantDto,
    );
    return usuarioTenant;
  }

  @ApiOperation({ summary: 'Actualizar una relación usuario-tenant' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarUsuarioTenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioTenantDto: UpdateUsuarioTenantDto,
  ) {
    const usuarioTenant =
      await this.usuarioTenantService.actualizarUsuarioTenant(
        id,
        updateUsuarioTenantDto,
      );
    return usuarioTenant;
  }

  @ApiOperation({ summary: 'Desactivar una relación usuario-tenant' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async desactivarUsuarioTenant(@Param('id', ParseIntPipe) id: number) {
    const usuarioTenant =
      await this.usuarioTenantService.desactivarUsuarioTenant(id);
    return usuarioTenant;
  }
}
