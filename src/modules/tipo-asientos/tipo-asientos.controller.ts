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
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { RequireTenant } from '../../common/decorators/require-tenant.decorator';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateTipoAsientoDto,
  UpdateTipoAsientoDto,
  FiltroTipoAsientoDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroTipoAsientoBuild } from './utils/filtro-tipo-asiento-build';

@ApiTags('tipo-asientos')
@ApiBearerAuth()
@Controller('tipo-asientos')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireTenant()
export class TipoAsientosController {
  constructor(private readonly tipoAsientosService: TipoAsientosService) {}

  @ApiOperation({ summary: 'Obtener todos los tipos de asiento' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get()
  async obtenerTiposAsiento(
    @Query() filtro: FiltroTipoAsientoDto,
    @TenantActual() tenant,
  ) {
    // Asegurar que solo se devuelvan tipos de asiento del tenant actual
    filtro.tenantId = tenant.id;

    const tiposAsiento = await this.tipoAsientosService.obtenerTiposAsiento(
      filtroTipoAsientoBuild(filtro),
    );
    return tiposAsiento;
  }

  @ApiOperation({ summary: 'Obtener un tipo de asiento por ID' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerTipoAsientoPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    const tipoAsiento = await this.tipoAsientosService.obtenerTipoAsiento({
      id,
      tenantId: tenant.id, // Asegurar que pertenezca al tenant actual
    });
    return tipoAsiento;
  }

  @ApiOperation({ summary: 'Crear un nuevo tipo de asiento' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearTipoAsiento(
    @Body() createTipoAsientoDto: CreateTipoAsientoDto,
    @TenantActual() tenant,
  ) {
    // Asegurar que el tipo de asiento se cree para el tenant actual
    createTipoAsientoDto.tenantId = tenant.id;

    const tipoAsiento =
      await this.tipoAsientosService.crearTipoAsiento(createTipoAsientoDto);
    return tipoAsiento;
  }

  @ApiOperation({ summary: 'Actualizar un tipo de asiento' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarTipoAsiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoAsientoDto: UpdateTipoAsientoDto,
    @TenantActual() tenant,
  ) {
    // Asegurar que el tipo de asiento pertenezca al tenant actual
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

  @ApiOperation({ summary: 'Desactivar o eliminar un tipo de asiento' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async desactivarTipoAsiento(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    // Asegurar que el tipo de asiento pertenezca al tenant actual
    await this.tipoAsientosService.obtenerTipoAsiento({
      id,
      tenantId: tenant.id,
    });

    const tipoAsiento =
      await this.tipoAsientosService.desactivarTipoAsiento(id);
    return tipoAsiento;
  }
}
