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
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { FiltroTenantDto } from './dto/filtro-tenant.dto';
import { filtroTenantBuild } from './utils/filtro-tenant-build';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @ApiOperation(
    CommonDescriptions.getPublic('cooperativas', 
    'Lista todas las cooperativas registradas en el sistema. Endpoint público que muestra información básica de las cooperativas activas.')
  )
  @Get()
  async obtenerTenants(@Query() filtro: FiltroTenantDto) {
    const tenants = await this.tenantsService.obtenerTenants(
      filtroTenantBuild(filtro),
    );
    return tenants;
  }

  @ApiOperation(
    CommonDescriptions.getById('cooperativa', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Obtiene los detalles completos de una cooperativa por su ID. Los administradores de cooperativa solo pueden ver su propia información.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerTenantPorId(@Param('id', ParseIntPipe) id: number) {
    const tenant = await this.tenantsService.obtenerTenant({ id });
    return tenant;
  }

  @ApiOperation(
    CommonDescriptions.create('cooperativa', [TipoUsuario.ADMIN_SISTEMA], 
    'Crea una nueva cooperativa en el sistema. Solo administradores del sistema pueden crear cooperativas. Incluye configuración inicial completa.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearTenant(@Body() createTenantDto: CreateTenantDto) {
    const tenant = await this.tenantsService.crearTenant(createTenantDto);
    return tenant;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Actualizar información de cooperativa',
      description: 'Actualiza la información de una cooperativa. Los administradores del sistema pueden actualizar cualquier cooperativa, mientras que los administradores de cooperativa solo pueden actualizar su propia información.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation(
    createApiOperation({
      summary: 'Desactivar una cooperativa',
      description: 'Desactiva una cooperativa del sistema. Solo administradores del sistema pueden desactivar cooperativas. Las cooperativas desactivadas no podrán operar.',
      roles: [TipoUsuario.ADMIN_SISTEMA],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async desactivarTenant(@Param('id', ParseIntPipe) id: number) {
    const tenant = await this.tenantsService.desactivarTenant(id);
    return tenant;
  }
}
