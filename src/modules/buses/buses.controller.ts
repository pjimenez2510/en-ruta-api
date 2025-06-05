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
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { CreateBusDto, UpdateBusDto, FiltroBusDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroBusBuild } from './utils/filtro-bus-build';

@ApiTags('buses')
@ApiBearerAuth()
@Controller('buses')
export class BusesController {
  constructor(private readonly busesService: BusesService) {}

  @ApiOperation({ summary: 'Obtener todos los buses' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireTenant()
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

  @ApiOperation({ summary: 'Obtener bus por ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireTenant()
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

    // Verificar que el bus pertenezca al tenant actual
    if (bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException('No tienes permisos para ver este bus');
    }

    return bus;
  }

  @ApiOperation({ summary: 'Crear nuevo bus' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireTenant()
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
  @RequireTenant()
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusDto: UpdateBusDto,
    @TenantActual() tenantActual,
  ) {
    // Verificar que el bus pertenezca al tenant actual
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
  @RequireTenant()
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/mantenimiento')
  async enviarAMantenimiento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    // Verificar que el bus pertenezca al tenant actual
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
  @RequireTenant()
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/activar')
  async activarBus(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    // Verificar que el bus pertenezca al tenant actual
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
  @RequireTenant()
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/retirar')
  async retirarBus(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    // Verificar que el bus pertenezca al tenant actual
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
