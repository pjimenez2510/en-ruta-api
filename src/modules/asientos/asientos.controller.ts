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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroAsientoBuild } from './utils/filtro-asiento-build';

@ApiTags('asientos')
@ApiBearerAuth()
@Controller('asientos')
export class AsientosController {
  constructor(private readonly asientosService: AsientosService) {}

  @ApiOperation(
    CommonDescriptions.getAll('asientos', [TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA], 
    'Lista todos los asientos de la cooperativa actual con filtros opcionales por bus, estado, tipo, etc. Incluye información del piso y bus asociado.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA)
  @Get()
  async obtenerAsientos(
    @Query() filtro: FiltroAsientoDto,
    @TenantActual() tenantActual,
  ) {
    return await this.asientosService.obtenerAsientos({
      filtro: filtroAsientoBuild(filtro, tenantActual.id),
    });
  }

  @ApiOperation(
    CommonDescriptions.getPublic('asientos', 
    'Lista todos los asientos disponibles públicamente con filtros opcionales. Útil para mostrar la distribución de asientos en aplicaciones cliente.')
  )
  @Get('publico')
  async obtenerAsientosPublico(@Query() filtro: FiltroAsientoDto) {
    return await this.asientosService.obtenerAsientos({
      filtro: filtroAsientoBuild(filtro),
    });
  }

  @ApiOperation(
    CommonDescriptions.getPublic('asiento específico', 
    'Obtiene los detalles completos de un asiento por su ID. Incluye información del tipo, ubicación, estado y bus asociado.')
  )
  @Get('publico/:id')
  async obtenerAsientoPublicoPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.asientosService.obtenerAsiento({
      filtro: { id },
    });
  }

  @ApiOperation(
    CommonDescriptions.getById('asiento', [TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA], 
    'Obtiene los detalles completos de un asiento de la cooperativa actual. Verifica permisos antes de mostrar la información.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA)
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

  @ApiOperation(
    CommonDescriptions.create('asiento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Crea un nuevo asiento individual en un piso de bus específico. Verifica que el piso pertenezca a la cooperativa actual antes de crear el asiento.')
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Crear múltiples asientos de manera masiva',
      description: 'Crea múltiples asientos automáticamente para un piso específico basado en una plantilla o configuración. Útil para configurar rápidamente la distribución de asientos en un bus nuevo.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA],
    })
  )
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

  @ApiOperation(
    CommonDescriptions.update('asiento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Actualiza la información de un asiento existente como tipo, ubicación o características especiales. Verifica permisos de la cooperativa antes de actualizar.')
  )
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

  @ApiOperation(
    CommonDescriptions.delete('asiento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Elimina un asiento del sistema. CUIDADO: Esta acción no se puede deshacer y puede afectar reservas existentes.')
  )
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

  @ApiOperation(
    CommonDescriptions.changeState('asiento', 'DISPONIBLE', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Cambia el estado del asiento a disponible para venta. Útil cuando un asiento sale de mantenimiento o se habilita para uso.')
  )
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

  @ApiOperation(
    CommonDescriptions.changeState('asiento', 'MANTENIMIENTO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Cambia el estado del asiento a mantenimiento. El asiento no estará disponible para venta hasta que vuelva a estar disponible.')
  )
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
