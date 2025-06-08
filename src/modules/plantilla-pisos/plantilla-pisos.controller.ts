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
import { filtroPlantillaPisoBuild } from './utils/filtro-plantilla-piso-build';

@ApiTags('plantilla-pisos')
@ApiBearerAuth()
@Controller('plantilla-pisos')
export class PlantillaPisosController {
  constructor(private readonly plantillaPisosService: PlantillaPisosService) {}

  @ApiOperation({
    summary: 'Obtener todas las plantillas de piso',
  })
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

  @ApiOperation({
    summary: 'Obtener plantilla de piso por ID',
  })
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

  @ApiOperation({ summary: 'Crear nueva plantilla de piso' })
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

  @ApiOperation({ summary: 'Actualizar plantilla de piso' })
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

  @ApiOperation({ summary: 'Eliminar plantilla de piso' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async eliminarPlantillaPiso(@Param('id', ParseIntPipe) id: number) {
    return await this.plantillaPisosService.eliminarPlantillaPiso(id);
  }

  @ApiOperation({ summary: 'Hacer pública una plantilla de piso' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id/hacer-publica')
  async hacerPublicaPlantillaPiso(@Param('id', ParseIntPipe) id: number) {
    return await this.plantillaPisosService.cambiarEstadoPublicoPlantillaPiso(
      id,
      true,
    );
  }

  @ApiOperation({ summary: 'Hacer privada una plantilla de piso' })
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
