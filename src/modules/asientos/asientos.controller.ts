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
  NotFoundException,
} from '@nestjs/common';
import { AsientosService } from './asientos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario, EstadoAsiento } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateAsientoDto,
  UpdateAsientoDto,
  FiltroAsientoDto,
  CreateAsientosMasivoDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { filtroAsientoBuild } from './utils/filtro-asiento-build';

@ApiTags('asientos')
@ApiBearerAuth()
@Controller('asientos')
export class AsientosController {
  constructor(private readonly asientosService: AsientosService) {}

  @ApiOperation({
    summary: 'Obtener todos los asientos con filtros opcionales',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerAsientos(
    @Query() filtro: FiltroAsientoDto,
    @TenantActual() tenantActual,
  ) {
    return await this.asientosService.obtenerAsientos({
      filtro: filtroAsientoBuild(filtro, tenantActual.id),
    });
  }

  @ApiOperation({
    summary: 'Obtener un asiento por su ID',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerAsientoPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const asientoCompleto = await this.asientosService[
      'prisma'
    ].asiento.findUnique({
      where: { id },
      include: {
        pisoBus: {
          include: {
            bus: true,
          },
        },
      },
    });

    if (!asientoCompleto) {
      throw new NotFoundException(`No se encontró el asiento con ID ${id}`);
    }

    if (asientoCompleto.pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException('No tienes permisos para ver este asiento');
    }

    return await this.asientosService.obtenerAsiento({
      filtro: { id },
    });
  }

  @ApiOperation({ summary: 'Crear un nuevo asiento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearAsiento(
    @Body() createAsientoDto: CreateAsientoDto,
    @TenantActual() tenantActual,
  ) {
    const pisoBus = await this.asientosService['prisma'].pisoBus.findUnique({
      where: { id: createAsientoDto.pisoBusId },
      include: { bus: true },
    });

    if (!pisoBus || pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para crear asientos en este piso de bus',
      );
    }

    return await this.asientosService.crearAsiento(createAsientoDto);
  }

  @ApiOperation({
    summary:
      'Crear múltiples asientos de manera masiva para un piso específico',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post('masivo')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateAsientosMasivoDto })
  async crearAsientosMasivo(
    @Body() createAsientosMasivoDto: CreateAsientosMasivoDto,
    @TenantActual() tenantActual,
  ) {
    const pisoBus = await this.asientosService['prisma'].pisoBus.findUnique({
      where: { id: createAsientosMasivoDto.pisoBusId },
      include: { bus: true },
    });

    if (!pisoBus || pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para crear asientos en este piso de bus',
      );
    }

    return await this.asientosService.crearAsientosMasivo(
      createAsientosMasivoDto,
    );
  }

  @ApiOperation({ summary: 'Actualizar un asiento existente' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarAsiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsientoDto: UpdateAsientoDto,
    @TenantActual() tenantActual,
  ) {
    const asiento = await this.asientosService['prisma'].asiento.findUnique({
      where: { id },
      include: { pisoBus: { include: { bus: true } } },
    });

    if (!asiento || asiento.pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este asiento',
      );
    }

    return await this.asientosService.actualizarAsiento(id, updateAsientoDto);
  }

  @ApiOperation({ summary: 'Eliminar un asiento' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarAsiento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const asiento = await this.asientosService['prisma'].asiento.findUnique({
      where: { id },
      include: { pisoBus: { include: { bus: true } } },
    });

    if (!asiento || asiento.pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este asiento',
      );
    }

    return await this.asientosService.eliminarAsiento(id);
  }

  @ApiOperation({ summary: 'Cambiar estado del asiento a DISPONIBLE' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/disponible')
  async establecerDisponible(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const asiento = await this.asientosService['prisma'].asiento.findUnique({
      where: { id },
      include: { pisoBus: { include: { bus: true } } },
    });

    if (!asiento || asiento.pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para cambiar el estado de este asiento',
      );
    }

    return await this.asientosService.cambiarEstadoAsiento(
      id,
      EstadoAsiento.DISPONIBLE,
    );
  }

  @ApiOperation({ summary: 'Cambiar estado del asiento a MANTENIMIENTO' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/mantenimiento')
  async establecerMantenimiento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const asiento = await this.asientosService['prisma'].asiento.findUnique({
      where: { id },
      include: { pisoBus: { include: { bus: true } } },
    });

    if (!asiento || asiento.pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para cambiar el estado de este asiento',
      );
    }

    return await this.asientosService.cambiarEstadoAsiento(
      id,
      EstadoAsiento.MANTENIMIENTO,
    );
  }
}
