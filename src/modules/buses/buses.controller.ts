import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { BusesService } from './buses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario, EstadoBus } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { CreateBusDto, UpdateBusDto, FiltroBusDto, ConsultaDisponibilidadBusDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroBusBuild } from './utils/filtro-bus-build';

@ApiTags('buses')
@ApiBearerAuth()
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @ApiOperation({
    summary: 'Obtener todos los buses de la cooperativa actual',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerBuses(
    @Query() filtro: FiltroBusDto,
    @TenantActual() tenantActual,
  ) {
    const buses = await this.busesService.obtenerBuses(
      filtroBusBuild(filtro, tenantActual.id),
    );
    return buses;
  }

  @ApiOperation({
    summary:
      'Obtener todos los buses de todas las cooperativas (Todos los usuarios pueden ver los buses - es publico)',
  })
  @Get('publico')
  async obtenerBusesPublico(@Query() filtro: FiltroBusDto) {
    const buses = await this.busesService.obtenerBuses(filtroBusBuild(filtro));
    return buses;
  }

  @ApiOperation({
    summary:
      'Obtener todos los buses de una cooperativa (Todos los usuarios pueden ver los buses - es publico)',
  })
  @Get('cooperativa/:idCooperativa')
  async obtenerBusesDeUnaCooperativaPublico(
    @Param('idCooperativa', ParseIntPipe) idCooperativa: number,
  ) {
    const buses = await this.busesService.obtenerBuses({
      tenantId: idCooperativa,
    });
    return buses;
  }

  @ApiOperation({
    summary: 'Consultar disponibilidad de asientos de un bus en un viaje específico (público)',
  })
  @Get(':id/disponibilidad')
  async consultarDisponibilidadBus(
    @Param('id', ParseIntPipe) busId: number,
    @Query() consulta: ConsultaDisponibilidadBusDto,
  ) {
    return await this.busesService.obtenerBusConDisponibilidad(
      busId,
      consulta.viajeId,
      consulta.ciudadOrigenId,
      consulta.ciudadDestinoId,
    );
  }

  @ApiOperation({
    summary: 'Obtener bus por ID (público)',
  })
  @Get('publico/:id')
  async obtenerBusPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.busesService.obtenerBus({ id });
  }

  @ApiOperation({
    summary: 'Obtener bus por ID de la cooperativa actual',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerBusPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const bus = await this.busesService.obtenerBus({ id });

    if (bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException('No tienes permisos para ver este bus');
    }

    return bus;
  }

  @ApiOperation({ summary: 'Crear nuevo bus' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearBus(
    @Body() createBusDto: CreateBusDto,
    @TenantActual() tenantActual,
  ) {
    const bus = await this.busesService.crearBus(tenantActual.id, createBusDto);
    return bus;
  }

  @ApiOperation({ summary: 'Actualizar bus' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusDto: UpdateBusDto,
    @TenantActual() tenantActual,
  ) {
    const bus = await this.busesService.obtenerBus({ id });
    if (bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este bus',
      );
    }

    return await this.busesService.actualizarBus(
      id,
      tenantActual.id,
      updateBusDto,
    );
  }

  @ApiOperation({ summary: 'Cambiar estado del bus a MANTENIMIENTO' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/mantenimiento')
  async enviarAMantenimiento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const bus = await this.busesService.obtenerBus({ id });
    if (bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para cambiar el estado de este bus',
      );
    }

    return await this.busesService.cambiarEstadoBus(id, {
      set: EstadoBus.MANTENIMIENTO,
    });
  }

  @ApiOperation({ summary: 'Cambiar estado del bus a ACTIVO' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/activar')
  async activarBus(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const bus = await this.busesService.obtenerBus({ id });
    if (bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para cambiar el estado de este bus',
      );
    }

    return await this.busesService.cambiarEstadoBus(id, {
      set: EstadoBus.ACTIVO,
    });
  }

  @ApiOperation({ summary: 'Cambiar estado del bus a RETIRADO' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/retirar')
  async retirarBus(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const bus = await this.busesService.obtenerBus({ id });
    if (bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para cambiar el estado de este bus',
      );
    }

    return await this.busesService.cambiarEstadoBus(id, {
      set: EstadoBus.RETIRADO,
    });
  }
}
