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
  Patch,
} from '@nestjs/common';
import { ViajesService } from './viajes.service';
import { GeneracionViajesService } from './services/generacion-viajes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario, EstadoViaje } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateViajeDto,
  UpdateViajeDto,
  FiltroViajeDto,
  GenerarViajesDto,
  FiltroViajePublicoDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { filtroViajeBuild } from './utils/filtro-viaje-build';
import { ViajesPublicoService } from './services/viajes-publico.service';

@ApiTags('viajes')
@ApiBearerAuth()
@Controller('viajes')
export class ViajesController {
  constructor(
    private readonly viajesService: ViajesService,
    private readonly generacionViajesService: GeneracionViajesService,
    private readonly viajesPublicoService: ViajesPublicoService,
  ) {}

  @ApiOperation({
    summary: 'Obtener viajes con filtros',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async obtenerViajes(
    @Query() filtro: FiltroViajeDto,
    @TenantActual() tenantActual,
  ) {
    const viajes = await this.viajesService.obtenerViajes(
      filtroViajeBuild(filtro, tenantActual.id),
    );
    return viajes;
  }

  @ApiOperation({
    summary: 'Previsualizar la generación de viajes',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post('generar/previsualizar')
  @HttpCode(HttpStatus.OK)
  async previsualizarGeneracion(
    @Body() generarViajesDto: GenerarViajesDto,
    @TenantActual() tenantActual,
  ) {
    return await this.generacionViajesService.previsualizarGeneracion(
      generarViajesDto,
      tenantActual.id,
    );
  }

  @ApiOperation({
    summary: 'Generar y guardar viajes automáticamente',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post('generar/ejecutar')
  @HttpCode(HttpStatus.CREATED)
  async generarYGuardarViajes(
    @Body() generarViajesDto: GenerarViajesDto,
    @TenantActual() tenantActual,
  ) {
    return await this.generacionViajesService.generarYGuardarViajes(
      generarViajesDto,
      tenantActual.id,
    );
  }

  @ApiOperation({
    summary: 'Obtener todos los viajes de todas las cooperativas (Público)',
  })
  @Get('publico')
  async obtenerViajesPublico(@Query() filtro: FiltroViajePublicoDto) {
    const viajes = await this.viajesPublicoService.obtenerViajesConSegmentos(filtro);
    return viajes;
  }

  @ApiOperation({
    summary: 'Obtener un viaje específico (Público)',
  })
  @Get('publico/:id')
  async obtenerViajePublico(@Param('id', ParseIntPipe) id: number) {
    const viaje = await this.viajesService.obtenerViaje({ id });
    return viaje;
  }

  @ApiOperation({
    summary: 'Obtener un viaje por ID',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async obtenerViajePorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.obtenerViaje({
      id,
      tenantId: tenantActual.id,
    });
    return viaje;
  }

  @ApiOperation({
    summary: 'Crear un nuevo viaje',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearViaje(
    @Body() createViajeDto: CreateViajeDto,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.crearViaje(
      createViajeDto,
      tenantActual.id,
    );
    return viaje;
  }

  @ApiOperation({
    summary: 'Actualizar un viaje',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarViaje(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateViajeDto: UpdateViajeDto,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.actualizarViaje(
      id,
      updateViajeDto,
      tenantActual.id,
    );
    return viaje;
  }

  @ApiOperation({
    summary: 'Iniciar un viaje (cambiar estado a EN_RUTA)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.CONDUCTOR,
  )
  @Patch(':id/iniciar')
  async iniciarViaje(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.cambiarEstadoViaje(
      id,
      EstadoViaje.EN_RUTA,
      tenantActual.id,
    );
    return viaje;
  }

  @ApiOperation({
    summary: 'Completar un viaje',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.CONDUCTOR,
  )
  @Patch(':id/completar')
  async completarViaje(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.cambiarEstadoViaje(
      id,
      EstadoViaje.COMPLETADO,
      tenantActual.id,
    );
    return viaje;
  }

  @ApiOperation({
    summary: 'Cancelar un viaje',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Patch(':id/cancelar')
  async cancelarViaje(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.cambiarEstadoViaje(
      id,
      EstadoViaje.CANCELADO,
      tenantActual.id,
    );
    return viaje;
  }

  @ApiOperation({
    summary: 'Marcar un viaje como retrasado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.CONDUCTOR,
  )
  @Patch(':id/retrasar')
  async retrasarViaje(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.cambiarEstadoViaje(
      id,
      EstadoViaje.RETRASADO,
      tenantActual.id,
    );
    return viaje;
  }

  @ApiOperation({
    summary: 'Reprogramar un viaje (volver a PROGRAMADO)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Patch(':id/reprogramar')
  async reprogramarViaje(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.cambiarEstadoViaje(
      id,
      EstadoViaje.PROGRAMADO,
      tenantActual.id,
    );
    return viaje;
  }

  @ApiOperation({
    summary: 'Eliminar un viaje',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarViaje(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.eliminarViaje(id, tenantActual.id);
    return viaje;
  }

} 