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
} from '@nestjs/common';
import { CiudadesService } from './ciudades.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroCiudadBuild } from './utils/filtro-ciudad-build';
import { FiltroCiudadDto, CreateCiudadDto, UpdateCiudadDto } from './dto';

@ApiTags('ciudades')
@ApiBearerAuth()
@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @ApiOperation({ summary: 'Obtener todas las ciudades' })
  @Get()
  async obtenerCiudades(@Query() filtro: FiltroCiudadDto) {
    const ciudades = await this.ciudadesService.obtenerCiudades(
      filtroCiudadBuild(filtro),
    );
    return ciudades;
  }

  @ApiOperation({ summary: 'Obtener ciudad por ID' })
  @Get(':id')
  async obtenerCiudadPorId(@Param('id', ParseIntPipe) id: number) {
    const ciudad = await this.ciudadesService.obtenerCiudad({ id });
    return ciudad;
  }

  @ApiOperation({ summary: 'Crear nueva ciudad' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearCiudad(@Body() createCiudadDto: CreateCiudadDto) {
    const ciudad = await this.ciudadesService.crearCiudad(createCiudadDto);
    return ciudad;
  }

  @ApiOperation({ summary: 'Actualizar ciudad' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id')
  async actualizarCiudad(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCiudadDto: UpdateCiudadDto,
  ) {
    const ciudad = await this.ciudadesService.actualizarCiudad(
      id,
      updateCiudadDto,
    );
    return ciudad;
  }

  @ApiOperation({ summary: 'Desactivar ciudad' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async desactivarCiudad(@Param('id', ParseIntPipe) id: number) {
    const ciudad = await this.ciudadesService.desactivarCiudad(id);
    return ciudad;
  }
}
