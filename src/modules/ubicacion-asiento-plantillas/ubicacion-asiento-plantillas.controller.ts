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
import { filtroUbicacionAsientoPlantillaBuild } from './utils/filtro-ubicacion-asiento-plantilla-build';

@ApiTags('ubicacion-asiento-plantillas')
@ApiBearerAuth()
@Controller('ubicacion-asiento-plantillas')
export class UbicacionAsientoPlantillasController {
  constructor(
    private readonly ubicacionAsientoPlantillasService: UbicacionAsientoPlantillasService,
  ) {}

  @ApiOperation({
    summary: 'Obtener todas las ubicaciones de asientos en plantillas',
  })
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

  @ApiOperation({
    summary: 'Obtener ubicación de asiento en plantilla por ID',
  })
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

  @ApiOperation({ summary: 'Crear nueva ubicación de asiento en plantilla' })
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

  @ApiOperation({ summary: 'Actualizar ubicación de asiento en plantilla' })
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

  @ApiOperation({ summary: 'Eliminar ubicación de asiento en plantilla' })
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

  @ApiOperation({ summary: 'Habilitar ubicación de asiento en plantilla' })
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

  @ApiOperation({ summary: 'Deshabilitar ubicación de asiento en plantilla' })
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
