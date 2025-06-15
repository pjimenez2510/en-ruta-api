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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroBusBuild } from './utils/filtro-bus-build';

@ApiTags('buses')
@ApiBearerAuth()
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @ApiOperation(
    CommonDescriptions.getAll('buses', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todos los buses de la cooperativa actual con filtros por modelo, estado, placa, etc. Solo muestra buses de la cooperativa autenticada.')
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic('buses', 
    'Lista todos los buses de todas las cooperativas. Endpoint público útil para mostrar información general de la flota disponible en aplicaciones cliente.')
  )
  @Get('publico')
  async obtenerBusesPublico(@Query() filtro: FiltroBusDto) {
    const buses = await this.busesService.obtenerBuses(filtroBusBuild(filtro));
    return buses;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener buses de una cooperativa específica',
      description: 'Lista todos los buses de una cooperativa específica. Endpoint público que permite a los usuarios ver la flota de buses de cualquier cooperativa.',
      isPublic: true,
    })
  )
  @Get('cooperativa/:idCooperativa')
  async obtenerBusesDeUnaCooperativaPublico(
    @Param('idCooperativa', ParseIntPipe) idCooperativa: number,
  ) {
    const buses = await this.busesService.obtenerBuses({
      tenantId: idCooperativa,
    });
    return buses;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Consultar disponibilidad de asientos en un bus',
      description: 'Consulta la disponibilidad de asientos de un bus específico para un viaje y tramo determinado. Útil para mostrar asientos disponibles antes de la compra.',
      isPublic: true,
    })
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic('bus específico', 
    'Obtiene los detalles completos de un bus por su ID. Incluye información del modelo, capacidad, distribución de asientos y características.')
  )
  @Get('publico/:id')
  async obtenerBusPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.busesService.obtenerBus({ id });
  }

  @ApiOperation(
    CommonDescriptions.getById('bus', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de un bus de la cooperativa actual. Verifica permisos antes de mostrar la información.')
  )
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

  @ApiOperation(
    CommonDescriptions.create('bus', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Crea un nuevo bus en la cooperativa. Requiere información del modelo, placa, capacidad y configuración de pisos/asientos.')
  )
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

  @ApiOperation(
    CommonDescriptions.update('bus', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Actualiza la información de un bus existente como modelo, placa, capacidad o configuración. Solo se pueden actualizar buses de la cooperativa actual.')
  )
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

  @ApiOperation(
    CommonDescriptions.changeState('bus', 'MANTENIMIENTO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Envía el bus a mantenimiento. El bus no estará disponible para asignar a viajes hasta que vuelva a estar activo.')
  )
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

  @ApiOperation(
    CommonDescriptions.changeState('bus', 'ACTIVO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Activa un bus para que esté disponible para asignar a viajes. El bus debe estar en buen estado para ser activado.')
  )
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

  @ApiOperation(
    CommonDescriptions.changeState('bus', 'RETIRADO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Retira un bus del servicio activo. Los buses retirados no se pueden asignar a viajes pero se mantienen en el sistema por registros históricos.')
  )
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
