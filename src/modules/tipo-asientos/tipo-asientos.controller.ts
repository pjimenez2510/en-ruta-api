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
import { TipoAsientosService } from './tipo-asientos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario, TipoUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateTipoAsientoDto,
  UpdateTipoAsientoDto,
  FiltroTipoAsientoDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroTipoAsientoBuild } from './utils/filtro-tipo-asiento-build';

@ApiTags('tipo-asientos')
@ApiBearerAuth()
@Controller('tipo-asientos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TipoAsientosController {
  constructor(private readonly tipoAsientosService: TipoAsientosService) {}

  @ApiOperation(
    CommonDescriptions.getAll('tipos de asiento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Lista todos los tipos de asiento de la cooperativa actual. Incluye categorías como VIP, ejecutivo, económico con sus características y precios.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Get()
  async obtenerTiposAsiento(
    @Query() filtro: FiltroTipoAsientoDto,
    @TenantActual() tenant,
  ) {
    const tiposAsiento = await this.tipoAsientosService.obtenerTiposAsiento(
      filtroTipoAsientoBuild(filtro, tenant.id),
    );
    return tiposAsiento;
  }

  @ApiOperation(
    CommonDescriptions.getById('tipo de asiento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Obtiene los detalles completos de un tipo de asiento específico. Incluye características, precios y configuraciones.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Get(':id')
  async obtenerTipoAsientoPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    const tipoAsiento = await this.tipoAsientosService.obtenerTipoAsiento({
      id,
      tenantId: tenant.id,
    });
    return tipoAsiento;
  }

  @ApiOperation(
    CommonDescriptions.create('tipo de asiento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Crea un nuevo tipo de asiento para la cooperativa. Define categorías, características, precios y niveles de servicio.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearTipoAsiento(
    @Body() createTipoAsientoDto: CreateTipoAsientoDto,
    @TenantActual() tenant,
  ) {
    createTipoAsientoDto.tenantId = tenant.id;

    const tipoAsiento =
      await this.tipoAsientosService.crearTipoAsiento(createTipoAsientoDto);
    return tipoAsiento;
  }

  @ApiOperation(
    CommonDescriptions.update('tipo de asiento', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Actualiza un tipo de asiento existente. Permite modificar características, precios y configuraciones del servicio.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id')
  async actualizarTipoAsiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoAsientoDto: UpdateTipoAsientoDto,
    @TenantActual() tenant,
  ) {
    await this.tipoAsientosService.obtenerTipoAsiento({
      id,
      tenantId: tenant.id,
    });

    const tipoAsiento = await this.tipoAsientosService.actualizarTipoAsiento(
      id,
      updateTipoAsientoDto,
    );
    return tipoAsiento;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Desactivar tipo de asiento',
      description: 'Desactiva un tipo de asiento de la cooperativa. Los tipos desactivados no estarán disponibles para nuevos asientos pero se mantienen para compatibilidad histórica.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Delete(':id')
  async desactivarTipoAsiento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    await this.tipoAsientosService.obtenerTipoAsiento({
      id,
      tenantId: tenant.id,
    });

    const tipoAsiento =
      await this.tipoAsientosService.desactivarTipoAsiento(id);
    return tipoAsiento;
  }
}
