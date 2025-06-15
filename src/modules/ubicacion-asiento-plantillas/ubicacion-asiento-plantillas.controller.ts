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
import { UbicacionAsientoPlantillasService } from './ubicacion-asiento-plantillas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import {
  CreateUbicacionAsientoPlantillaDto,
  UpdateUbicacionAsientoPlantillaDto,
  FiltroUbicacionAsientoPlantillaDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroUbicacionAsientoPlantillaBuild } from './utils/filtro-ubicacion-asiento-plantilla-build';

@ApiTags('ubicacion-asiento-plantillas')
@ApiBearerAuth()
@Controller('ubicacion-asiento-plantillas')
export class UbicacionAsientoPlantillasController {
  constructor(
    private readonly ubicacionAsientoPlantillasService: UbicacionAsientoPlantillasService,
  ) {}

  @ApiOperation(
    CommonDescriptions.getAll('ubicaciones de asientos en plantillas', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todas las ubicaciones de asientos configuradas en plantillas. Define posiciones, coordenadas y distribuciones espaciales.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerUbicacionesAsientoPlantilla(
    @Query() filtro: FiltroUbicacionAsientoPlantillaDto,
  ) {
    return await this.ubicacionAsientoPlantillasService.obtenerUbicacionesAsientoPlantilla(
      {
        filtro: filtroUbicacionAsientoPlantillaBuild(filtro),
      },
    );
  }

  @ApiOperation(
    CommonDescriptions.getById('ubicación de asiento en plantilla', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles de una ubicación específica de asiento en plantilla. Incluye coordenadas, estado y configuraciones.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerUbicacionAsientoPlantillaPorId(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.ubicacionAsientoPlantillasService.obtenerUbicacionAsientoPlantilla(
      {
        filtro: { id },
      },
    );
  }

  @ApiOperation(
    CommonDescriptions.create('ubicación de asiento en plantilla', [TipoUsuario.ADMIN_SISTEMA], 
    'Crea una nueva ubicación de asiento en una plantilla. Define posición espacial, coordenadas y configuraciones para la distribución automática de asientos.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearUbicacionAsientoPlantilla(
    @Body()
    createUbicacionAsientoPlantillaDto: CreateUbicacionAsientoPlantillaDto,
  ) {
    return await this.ubicacionAsientoPlantillasService.crearUbicacionAsientoPlantilla(
      createUbicacionAsientoPlantillaDto,
    );
  }

  @ApiOperation(
    CommonDescriptions.update('ubicación de asiento en plantilla', [TipoUsuario.ADMIN_SISTEMA], 
    'Actualiza una ubicación de asiento en plantilla existente. Permite modificar coordenadas, estado y configuraciones espaciales.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id')
  async actualizarUbicacionAsientoPlantilla(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateUbicacionAsientoPlantillaDto: UpdateUbicacionAsientoPlantillaDto,
  ) {
    return await this.ubicacionAsientoPlantillasService.actualizarUbicacionAsientoPlantilla(
      id,
      updateUbicacionAsientoPlantillaDto,
    );
  }

  @ApiOperation(
    CommonDescriptions.delete('ubicación de asiento en plantilla', [TipoUsuario.ADMIN_SISTEMA], 
    'Elimina una ubicación de asiento de la plantilla. CUIDADO: Esta acción puede afectar buses que usen esta plantilla.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async eliminarUbicacionAsientoPlantilla(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.ubicacionAsientoPlantillasService.eliminarUbicacionAsientoPlantilla(
      id,
    );
  }

  @ApiOperation(
    CommonDescriptions.changeState('ubicación de asiento', 'HABILITADA', [TipoUsuario.ADMIN_SISTEMA], 
    'Habilita una ubicación de asiento en la plantilla. Las ubicaciones habilitadas estarán disponibles para crear asientos.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id/habilitar')
  async habilitarUbicacionAsientoPlantilla(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.ubicacionAsientoPlantillasService.cambiarEstadoUbicacionAsientoPlantilla(
      id,
      true,
    );
  }

  @ApiOperation(
    CommonDescriptions.changeState('ubicación de asiento', 'DESHABILITADA', [TipoUsuario.ADMIN_SISTEMA], 
    'Deshabilita una ubicación de asiento en la plantilla. Las ubicaciones deshabilitadas no se usarán para crear nuevos asientos.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id/deshabilitar')
  async deshabilitarUbicacionAsientoPlantilla(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.ubicacionAsientoPlantillasService.cambiarEstadoUbicacionAsientoPlantilla(
      id,
      false,
    );
  }
}
