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
import { filtroConfiguracionDescuentoBuild } from './utils/filtro-configuracion-descuento-build';

@ApiTags('configuracion-descuentos')
@ApiBearerAuth()
@Controller('configuracion-descuentos')
export class ConfiguracionDescuentosController {
  constructor(private readonly configuracionDescuentosService: ConfiguracionDescuentosService) {}

  @ApiOperation({
    summary: 'Obtener todas las configuraciones de descuento de la cooperativa actual',
  })
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

  @ApiOperation({
    summary: 'Obtener todas las configuraciones de descuento activas (Público)',
  })
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

  @ApiOperation({
    summary: 'Obtener configuraciones de descuento de una cooperativa específica (Público)',
  })
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

  @ApiOperation({
    summary: 'Obtener configuración de descuento por ID (público)',
  })
  @Get('publico/:id')
  async obtenerConfiguracionDescuentoPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.configuracionDescuentosService.obtenerConfiguracionDescuento({ id });
  }

  @ApiOperation({
    summary: 'Obtener configuración de descuento por ID de la cooperativa actual',
  })
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

  @ApiOperation({ summary: 'Crear nueva configuración de descuento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Actualizar configuración de descuento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Desactivar configuración de descuento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Activar configuración de descuento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Eliminar configuración de descuento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Obtener configuración de descuento por tipo' })
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