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
import { PlantillaPisosService } from './plantilla-pisos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import {
  CreatePlantillaPisoDto,
  UpdatePlantillaPisoDto,
  FiltroPlantillaPisoDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroPlantillaPisoBuild } from './utils/filtro-plantilla-piso-build';

@ApiTags('plantilla-pisos')
@ApiBearerAuth()
@Controller('plantilla-pisos')
export class PlantillaPisosController {
  constructor(private readonly plantillaPisosService: PlantillaPisosService) {}

  @ApiOperation(
    CommonDescriptions.getAll('plantillas de piso', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todas las plantillas de piso disponibles. Incluye plantillas predefinidas y personalizadas para diferentes tipos de buses.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerPlantillasPiso(@Query() filtro: FiltroPlantillaPisoDto) {
    return await this.plantillaPisosService.obtenerPlantillasPiso({
      filtro: filtroPlantillaPisoBuild(filtro),
    });
  }

  @ApiOperation(
    CommonDescriptions.getById('plantilla de piso', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de una plantilla de piso. Incluye distribución de asientos, dimensiones y configuraciones.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerPlantillaPisoPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.plantillaPisosService.obtenerPlantillaPiso({
      filtro: { id },
    });
  }

  @ApiOperation(
    CommonDescriptions.create('plantilla de piso', [TipoUsuario.ADMIN_SISTEMA], 
    'Crea una nueva plantilla de piso. Solo administradores del sistema pueden crear plantillas que estarán disponibles para todas las cooperativas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearPlantillaPiso(
    @Body() createPlantillaPisoDto: CreatePlantillaPisoDto,
  ) {
    return await this.plantillaPisosService.crearPlantillaPiso(
      createPlantillaPisoDto,
    );
  }

  @ApiOperation(
    CommonDescriptions.update('plantilla de piso', [TipoUsuario.ADMIN_SISTEMA], 
    'Actualiza una plantilla de piso existente. Solo administradores del sistema pueden modificar plantillas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id')
  async actualizarPlantillaPiso(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlantillaPisoDto: UpdatePlantillaPisoDto,
  ) {
    return await this.plantillaPisosService.actualizarPlantillaPiso(
      id,
      updatePlantillaPisoDto,
    );
  }

  @ApiOperation(
    CommonDescriptions.delete('plantilla de piso', [TipoUsuario.ADMIN_SISTEMA], 
    'Elimina una plantilla de piso del sistema. CUIDADO: Esta acción puede afectar buses que usen esta plantilla.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async eliminarPlantillaPiso(@Param('id', ParseIntPipe) id: number) {
    return await this.plantillaPisosService.eliminarPlantillaPiso(id);
  }

  @ApiOperation(
    CommonDescriptions.changeState('plantilla de piso', 'PÚBLICA', [TipoUsuario.ADMIN_SISTEMA], 
    'Hace pública una plantilla de piso para que esté disponible para todas las cooperativas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id/hacer-publica')
  async hacerPublicaPlantillaPiso(@Param('id', ParseIntPipe) id: number) {
    return await this.plantillaPisosService.cambiarEstadoPublicoPlantillaPiso(
      id,
      true,
    );
  }

  @ApiOperation(
    CommonDescriptions.changeState('plantilla de piso', 'PRIVADA', [TipoUsuario.ADMIN_SISTEMA], 
    'Hace privada una plantilla de piso restringiendo su acceso solo a cooperativas específicas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id/hacer-privada')
  async hacerPrivadaPlantillaPiso(@Param('id', ParseIntPipe) id: number) {
    return await this.plantillaPisosService.cambiarEstadoPublicoPlantillaPiso(
      id,
      false,
    );
  }
}
