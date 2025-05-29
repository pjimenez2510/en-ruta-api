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
  ForbiddenException,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { FiltroTenantDto } from './dto/filtro-tenant.dto';
import { filtroTenantBuild } from './utils/filtro-tenant-build';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation({ summary: 'Obtener todos los tenants' })
  @Get()
  async obtenerTenants(@Query() filtro: FiltroTenantDto) {
    const tenants = await this.tenantsService.obtenerTenants(
      filtroTenantBuild(filtro),
    );
    return tenants;
  }

  @ApiOperation({ summary: 'Obtener tenant por ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerTenantPorId(@Param('id', ParseIntPipe) id: number) {
    const tenant = await this.tenantsService.obtenerTenant({ id });
    return tenant;
  }

  @ApiOperation({ summary: 'Crear nuevo tenant' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearTenant(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsService.crearTenant(createTenantDto);
    return tenant;
  }

  @ApiOperation({ summary: 'Actualizar tenant' })
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
      throw new ForbiddenException(
        'No tienes permisos para actualizar este tenant',
      );
    }

    if (usuario.tipoUsuario !== TipoUsuario.ADMIN_SISTEMA) {
      delete updateTenantDto.activo;
    }

    const tenant = await this.tenantsService.actualizarTenant(
      id,
      updateTenantDto,
    );
    return tenant;
  }

  @ApiOperation({ summary: 'Desactivar tenant' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async desactivarTenant(@Param('id', ParseIntPipe) id: number) {
    const tenant = await this.tenantsService.desactivarTenant(id);
    return tenant;
  }
}
