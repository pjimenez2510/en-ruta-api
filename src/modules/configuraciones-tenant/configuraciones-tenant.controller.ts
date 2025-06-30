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
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateConfiguracionesTenantDto,
  UpdateConfiguracionesTenantDto,
  FiltroConfiguracionesTenantDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroConfiguracionesTenantBuild } from './utils/filtro-configuraciones-tenant-build';

@ApiTags('configuraciones-tenant')
@ApiBearerAuth()
@Controller('configuraciones-tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfiguracionesTenantController {
  constructor(
    private readonly configuracionesTenantService: ConfiguracionesTenantService,
  ) {}

  @ApiOperation(
    CommonDescriptions.getAll('configuraciones', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Lista todas las configuraciones de la cooperativa actual. Incluye parámetros operativos, límites, políticas y ajustes personalizados.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Get()
  async obtenerConfiguraciones(
    @Query() filtro: FiltroConfiguracionesTenantDto,
    @TenantActual() tenant,
  ) {
    filtro.tenantId = tenant.id;

    const configuraciones =
      await this.configuracionesTenantService.obtenerConfiguraciones(
        filtroConfiguracionesTenantBuild(filtro),
      );
    return configuraciones;
  }

  @ApiOperation(
    CommonDescriptions.getById('configuración', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Obtiene los detalles de una configuración específica de la cooperativa. Incluye valor actual, tipo de dato y descripción.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Get(':id')
  async obtenerConfiguracionPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    const configuracion =
      await this.configuracionesTenantService.obtenerConfiguracion({
        id,
        tenantId: tenant.id,
      });
    return configuracion;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Crear nueva configuración personalizada',
      description: 'Crea una nueva configuración específica para la cooperativa. Permite definir parámetros operativos personalizados según las necesidades del negocio.',
      roles: [RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @Roles(RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearConfiguracion(
    @Body() createConfiguracionesTenantDto: CreateConfiguracionesTenantDto,
    @TenantActual() tenant,
  ) {
    createConfiguracionesTenantDto.tenantId = tenant.id;

    const configuracion =
      await this.configuracionesTenantService.crearConfiguracion(
        createConfiguracionesTenantDto,
      );
    return configuracion;
  }

  @ApiOperation(
    CommonDescriptions.update('configuración', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Actualiza el valor de una configuración existente. Los cambios pueden afectar el comportamiento operativo de la cooperativa.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id')
  async actualizarConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConfiguracionesTenantDto: UpdateConfiguracionesTenantDto,
    @TenantActual() tenant,
  ) {
    await this.configuracionesTenantService.obtenerConfiguracion({
      id,
      tenantId: tenant.id,
    });

    updateConfiguracionesTenantDto.tenantId = tenant.id;

    const configuracion =
      await this.configuracionesTenantService.actualizarConfiguracion(
        id,
        updateConfiguracionesTenantDto,
      );
    return configuracion;
  }

  @ApiOperation(
    CommonDescriptions.delete('configuración', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Elimina una configuración personalizada de la cooperativa. CUIDADO: Esto puede afectar funcionalidades que dependan de esta configuración.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Delete(':id')
  async eliminarConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    await this.configuracionesTenantService.obtenerConfiguracion({
      id,
      tenantId: tenant.id,
    });

    const configuracion =
      await this.configuracionesTenantService.eliminarConfiguracion(id);
    return configuracion;
  }
}
