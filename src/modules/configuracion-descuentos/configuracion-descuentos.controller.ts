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
import { ConfiguracionDescuentosService } from './configuracion-descuentos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateConfiguracionDescuentoDto,
  UpdateConfiguracionDescuentoDto,
  FiltroConfiguracionDescuentoDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroConfiguracionDescuentoBuild } from './utils/filtro-configuracion-descuento-build';

@ApiTags('configuracion-descuentos')
@ApiBearerAuth()
@Controller('configuracion-descuentos')
export class ConfiguracionDescuentosController {
  constructor(private readonly configuracionDescuentosService: ConfiguracionDescuentosService) {}

  @ApiOperation(
    CommonDescriptions.getAll('configuraciones de descuento', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todas las configuraciones de descuento de la cooperativa actual. Incluye descuentos por edad, discapacidad, estudiantes, etc.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerConfiguracionesDescuento(
    @Query() filtro: FiltroConfiguracionDescuentoDto,
    @TenantActual() tenantActual,
  ) {
    const configuraciones = await this.configuracionDescuentosService.obtenerConfiguracionesDescuento(
      filtroConfiguracionDescuentoBuild(filtro, tenantActual.id),
      undefined,
      filtro,
    );
    return configuraciones;
  }

  @ApiOperation(
    CommonDescriptions.getPublic('configuraciones de descuento activas', 
    'Lista todas las configuraciones de descuento activas de todas las cooperativas. Endpoint público para mostrar descuentos disponibles.')
  )
  @Get('publico')
  async obtenerConfiguracionesDescuentoPublico(@Query() filtro: FiltroConfiguracionDescuentoDto) {
    const filtroPublico = { ...filtro, activo: true };
    const configuraciones = await this.configuracionDescuentosService.obtenerConfiguracionesDescuento(
      filtroConfiguracionDescuentoBuild(filtroPublico),
      undefined,
      filtroPublico,
    );
    return configuraciones;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener descuentos de una cooperativa específica',
      description: 'Lista las configuraciones de descuento activas de una cooperativa específica. Endpoint público que permite consultar descuentos por cooperativa.',
      isPublic: true,
    })
  )
  @Get('cooperativa/:idCooperativa')
  async obtenerConfiguracionesDescuentoDeUnaCooperativaPublico(
    @Param('idCooperativa', ParseIntPipe) idCooperativa: number,
    @Query() filtro: FiltroConfiguracionDescuentoDto,
  ) {
    const filtroPublico = { ...filtro, activo: true };
    const configuraciones = await this.configuracionDescuentosService.obtenerConfiguracionesDescuento(
      filtroConfiguracionDescuentoBuild(filtroPublico, idCooperativa),
      undefined,
      filtroPublico,
    );
    return configuraciones;
  }

  @ApiOperation(
    CommonDescriptions.getPublic('configuración de descuento específica', 
    'Obtiene los detalles de una configuración de descuento por su ID. Incluye porcentajes, condiciones y requisitos.')
  )
  @Get('publico/:id')
  async obtenerConfiguracionDescuentoPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.configuracionDescuentosService.obtenerConfiguracionDescuento({ id });
  }

  @ApiOperation(
    CommonDescriptions.getById('configuración de descuento', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de una configuración de descuento de la cooperativa actual.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerConfiguracionDescuentoPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.configuracionDescuentosService.obtenerConfiguracionDescuento({
      id,
      tenantId: tenantActual.id,
    });
  }

  @ApiOperation(
    CommonDescriptions.create('configuración de descuento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Crea una nueva configuración de descuento. Define porcentajes, condiciones de aplicación y tipos de descuento disponibles.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearConfiguracionDescuento(
    @Body() createConfiguracionDescuentoDto: CreateConfiguracionDescuentoDto,
    @TenantActual() tenantActual,
  ) {
    const configuracion = await this.configuracionDescuentosService.crearConfiguracionDescuento(
      createConfiguracionDescuentoDto,
      tenantActual.id,
    );
    return configuracion;
  }

  @ApiOperation(
    CommonDescriptions.update('configuración de descuento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Actualiza una configuración de descuento existente. Permite modificar porcentajes, condiciones y estado de la configuración.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id')
  async actualizarConfiguracionDescuento(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConfiguracionDescuentoDto: UpdateConfiguracionDescuentoDto,
    @TenantActual() tenantActual,
  ) {
    return await this.configuracionDescuentosService.actualizarConfiguracionDescuento(
      id,
      updateConfiguracionDescuentoDto,
      tenantActual.id,
    );
  }

  @ApiOperation(
    CommonDescriptions.changeState('configuración de descuento', 'DESACTIVADA', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Desactiva una configuración de descuento. Los descuentos desactivados no se aplicarán en nuevas ventas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id/desactivar')
  async desactivarConfiguracionDescuento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.configuracionDescuentosService.desactivarConfiguracionDescuento(
      id,
      tenantActual.id,
    );
  }

  @ApiOperation(
    CommonDescriptions.changeState('configuración de descuento', 'ACTIVA', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Activa una configuración de descuento. Los descuentos activos se aplicarán automáticamente según sus condiciones.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id/activar')
  async activarConfiguracionDescuento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.configuracionDescuentosService.activarConfiguracionDescuento(
      id,
      tenantActual.id,
    );
  }

  @ApiOperation(
    CommonDescriptions.delete('configuración de descuento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Elimina permanentemente una configuración de descuento. CUIDADO: Esta acción no se puede deshacer.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Delete(':id')
  async eliminarConfiguracionDescuento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.configuracionDescuentosService.eliminarConfiguracionDescuento(
      id,
      tenantActual.id,
    );
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener configuración de descuento por tipo',
      description: 'Busca configuraciones de descuento por tipo específico (edad, discapacidad, estudiante, etc.). Útil para aplicar descuentos automáticamente.',
      roles: [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('tipo/:tipo')
  async obtenerConfiguracionPorTipo(
    @Param('tipo') tipo: string,
    @TenantActual() tenantActual,
  ) {
    return await this.configuracionDescuentosService.obtenerConfiguracionPorTipo(
      tenantActual.id,
      tipo,
    );
  }
} 