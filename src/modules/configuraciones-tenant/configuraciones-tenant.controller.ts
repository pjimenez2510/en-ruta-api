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
import { ConfiguracionesTenantService } from './configuraciones-tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateConfiguracionesTenantDto,
  UpdateConfiguracionesTenantDto,
  FiltroConfiguracionesTenantDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroConfiguracionesTenantBuild } from './utils/filtro-configuraciones-tenant-build';

@ApiTags('configuraciones-tenant')
@ApiBearerAuth()
@Controller('configuraciones-tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireTenant()
export class ConfiguracionesTenantController {
  constructor(
    private readonly configuracionesTenantService: ConfiguracionesTenantService,
  ) {}

  @ApiOperation({ summary: 'Obtener todas las configuraciones del tenant' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get()
  async obtenerConfiguraciones(
    @Query() filtro: FiltroConfiguracionesTenantDto,
    @TenantActual() tenant,
  ) {
    // Asegurar que solo se devuelvan configuraciones del tenant actual
    filtro.tenantId = tenant.id;

    const configuraciones =
      await this.configuracionesTenantService.obtenerConfiguraciones(
        filtroConfiguracionesTenantBuild(filtro),
      );
    return configuraciones;
  }

  @ApiOperation({ summary: 'Obtener una configuración por ID' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerConfiguracionPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    const configuracion =
      await this.configuracionesTenantService.obtenerConfiguracion({
        id,
        tenantId: tenant.id, // Asegurar que pertenezca al tenant actual
      });
    return configuracion;
  }

  @ApiOperation({ summary: 'Crear una nueva configuración' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearConfiguracion(
    @Body() createConfiguracionesTenantDto: CreateConfiguracionesTenantDto,
    @TenantActual() tenant,
  ) {
    // Asegurar que la configuración se cree para el tenant actual
    createConfiguracionesTenantDto.tenantId = tenant.id;

    const configuracion =
      await this.configuracionesTenantService.crearConfiguracion(
        createConfiguracionesTenantDto,
      );
    return configuracion;
  }

  @ApiOperation({ summary: 'Actualizar una configuración' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConfiguracionesTenantDto: UpdateConfiguracionesTenantDto,
    @TenantActual() tenant,
  ) {
    // Asegurar que la configuración pertenezca al tenant actual
    await this.configuracionesTenantService.obtenerConfiguracion({
      id,
      tenantId: tenant.id,
    });

    // Asegurar que se actualice para el mismo tenant
    updateConfiguracionesTenantDto.tenantId = tenant.id;

    const configuracion =
      await this.configuracionesTenantService.actualizarConfiguracion(
        id,
        updateConfiguracionesTenantDto,
      );
    return configuracion;
  }

  @ApiOperation({ summary: 'Eliminar una configuración' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    // Asegurar que la configuración pertenezca al tenant actual
    await this.configuracionesTenantService.obtenerConfiguracion({
      id,
      tenantId: tenant.id,
    });

    const configuracion =
      await this.configuracionesTenantService.eliminarConfiguracion(id);
    return configuracion;
  }
}
