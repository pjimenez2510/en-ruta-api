import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TiposRutaBusService } from './tipos-ruta-bus.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { CreateTipoRutaBusDto, UpdateTipoRutaBusDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';

@ApiTags('tipos-ruta-bus')
@ApiBearerAuth()
@Controller('tipos-ruta-bus')
export class TiposRutaBusController {
  constructor(private readonly tiposRutaBusService: TiposRutaBusService) {}

  @ApiOperation(
    CommonDescriptions.getAll('tipos de ruta de bus', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todos los tipos de ruta de bus de la cooperativa actual.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerTiposRutaBus(@TenantActual() tenantActual) {
    const tiposRutaBus = await this.tiposRutaBusService.obtenerTiposRutaBus({
      tenantId: tenantActual.id,
    });
    return tiposRutaBus;
  }

  @ApiOperation(
    CommonDescriptions.getById('tipo de ruta de bus', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles de un tipo de ruta de bus específico.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerTipoRutaBusPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const tipoRutaBus = await this.tiposRutaBusService.obtenerTipoRutaBus({
      id,
      tenantId: tenantActual.id,
    });
    return tipoRutaBus;
  }

  @ApiOperation(
    CommonDescriptions.create('tipo de ruta de bus', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
    ], 'Crea un nuevo tipo de ruta de bus para la cooperativa.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearTipoRutaBus(
    @Body() createTipoRutaBusDto: CreateTipoRutaBusDto,
    @TenantActual() tenantActual,
  ) {
    const tipoRutaBus = await this.tiposRutaBusService.crearTipoRutaBus(
      tenantActual.id,
      createTipoRutaBusDto,
    );
    return tipoRutaBus;
  }

  @ApiOperation(
    CommonDescriptions.update('tipo de ruta de bus', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
    ], 'Actualiza la información de un tipo de ruta de bus existente.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarTipoRutaBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoRutaBusDto: UpdateTipoRutaBusDto,
    @TenantActual() tenantActual,
  ) {
    const tipoRutaBus = await this.tiposRutaBusService.actualizarTipoRutaBus(
      id,
      tenantActual.id,
      updateTipoRutaBusDto,
    );
    return tipoRutaBus;
  }

  @ApiOperation(
    CommonDescriptions.delete('tipo de ruta de bus', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
    ], 'Elimina un tipo de ruta de bus. Solo se puede eliminar si no tiene buses o rutas asociadas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarTipoRutaBus(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const tipoRutaBus = await this.tiposRutaBusService.eliminarTipoRutaBus(
      id,
      tenantActual.id,
    );
    return tipoRutaBus;
  }
} 