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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { filtroViajeBuild } from './utils/filtro-viaje-build';
import { ViajesPublicoService } from './services/viajes-publico.service';
import {
  createApiOperation,
  CommonDescriptions,
} from '../../common/utils/swagger-descriptions.util';

@ApiTags('viajes')
@ApiBearerAuth()
@Controller('viajes')
export class ViajesController {
  constructor(
    private readonly viajesService: ViajesService,
    private readonly generacionViajesService: GeneracionViajesService,
    private readonly viajesPublicoService: ViajesPublicoService,
  ) {}

  @ApiOperation(
    CommonDescriptions.getAll(
      'viajes',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
      ],
      'Permite filtrar por fecha, estado, ruta y otros criterios. Solo muestra los viajes de la cooperativa actual.',
    ),
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Previsualizar la generación automática de viajes',
      description:
        'Simula la generación de viajes basada en horarios de ruta sin guardarlos en la base de datos. Útil para revisar antes de ejecutar la generación real.',
      roles: [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Generar y guardar viajes automáticamente',
      description:
        'Ejecuta la generación masiva de viajes basada en los horarios de ruta configurados. Los viajes se crean con estado PROGRAMADO.',
      roles: [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic(
      'viajes con segmentos',
      'Endpoint público que muestra viajes de todas las cooperativas con información de segmentos y paradas. Ideal para aplicaciones cliente que muestran horarios de viajes.',
    ),
  )
  @Get('publico')
  async obtenerViajesPublico(@Query() filtro: FiltroViajePublicoDto) {
    const viajes =
      await this.viajesPublicoService.obtenerViajesConSegmentos(filtro);
    return viajes;
  }

  @ApiOperation(
    CommonDescriptions.getPublic(
      'viaje específico',
      'Obtiene los detalles completos de un viaje específico incluyendo información de ruta, bus, conductor y disponibilidad de asientos.',
    ),
  )
  @Get('publico/:id')
  async obtenerViajePublico(@Param('id', ParseIntPipe) id: number) {
    const viaje = await this.viajesService.obtenerViaje({ id });
    return viaje;
  }

  @ApiOperation(
    CommonDescriptions.getById(
      'viaje',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
      ],
      'Solo se pueden obtener viajes de la cooperativa actual. Incluye información completa del viaje.',
    ),
  )
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

  @ApiOperation(
    CommonDescriptions.create(
      'viaje',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
      'Crea un viaje manual. Requiere especificar bus, conductor, ruta y horarios. El viaje se crea con estado PROGRAMADO.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
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

  @ApiOperation(
    CommonDescriptions.update(
      'viaje',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
      'Permite actualizar información del viaje como horarios, bus asignado o conductor. No se puede modificar si el viaje ya está EN_RUTA o COMPLETADO.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
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

  @ApiOperation(
    CommonDescriptions.changeState(
      'viaje',
      'EN_RUTA',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
      ],
      'Marca el viaje como iniciado. Solo se puede iniciar un viaje que esté en estado PROGRAMADO. Los conductores pueden iniciar sus propios viajes.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
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

  @ApiOperation(
    CommonDescriptions.changeState(
      'viaje',
      'COMPLETADO',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
      ],
      'Marca el viaje como completado. Solo se puede completar un viaje que esté EN_RUTA. Los conductores pueden completar sus propios viajes.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
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

  @ApiOperation(
    CommonDescriptions.changeState(
      'viaje',
      'CANCELADO',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
      'Cancela un viaje. Los boletos vendidos para este viaje deben ser reembolsados manualmente. Solo administradores pueden cancelar viajes.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
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

  @ApiOperation(
    CommonDescriptions.changeState(
      'viaje',
      'RETRASADO',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
      ],
      'Marca el viaje como retrasado. Útil para informar a los pasajeros sobre demoras. Los conductores pueden marcar sus propios viajes como retrasados.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
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

  @ApiOperation(
    CommonDescriptions.changeState(
      'viaje',
      'PROGRAMADO',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
      'Reprograma un viaje cancelado o retrasado volviéndolo al estado PROGRAMADO. Solo administradores pueden reprogramar viajes.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
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

  @ApiOperation(
    CommonDescriptions.delete(
      'viaje',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
      'Elimina permanentemente un viaje del sistema. CUIDADO: Esta acción no se puede deshacer y eliminará todos los boletos asociados.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Delete(':id')
  async eliminarViaje(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const viaje = await this.viajesService.eliminarViaje(id, tenantActual.id);
    return viaje;
  }
}
