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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroCiudadBuild } from './utils/filtro-ciudad-build';
import { FiltroCiudadDto, CreateCiudadDto, UpdateCiudadDto } from './dto';

@ApiTags('ciudades')
@ApiBearerAuth()
@Controller('ciudades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @ApiOperation(
    CommonDescriptions.getPublic('ciudades', 
    'Lista todas las ciudades disponibles en el sistema. Endpoint público que no requiere autenticación y permite filtros por nombre, código o estado.')
  )
  @Get()
  async obtenerCiudades(@Query() filtro: FiltroCiudadDto) {
    const ciudades = await this.ciudadesService.obtenerCiudades(
      filtroCiudadBuild(filtro),
    );
    return ciudades;
  }

  @ApiOperation(
    CommonDescriptions.getPublic('ciudad específica', 
    'Obtiene los detalles completos de una ciudad por su ID. Endpoint público que incluye información completa como nombre, código postal, departamento, etc.')
  )
  @Get(':id')
  async obtenerCiudadPorId(@Param('id', ParseIntPipe) id: number) {
    const ciudad = await this.ciudadesService.obtenerCiudad({ id });
    return ciudad;
  }

  @ApiOperation(
    CommonDescriptions.create('ciudad', [TipoUsuario.ADMIN_SISTEMA], 
    'Crea una nueva ciudad en el sistema. Requiere nombre único, código postal y información del departamento. Solo administradores del sistema pueden crear ciudades.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearCiudad(@Body() createCiudadDto: CreateCiudadDto) {
    const ciudad = await this.ciudadesService.crearCiudad(createCiudadDto);
    return ciudad;
  }

  @ApiOperation(
    CommonDescriptions.update('ciudad', [TipoUsuario.ADMIN_SISTEMA], 
    'Actualiza la información de una ciudad existente. Permite modificar nombre, código postal y otros datos. Solo administradores del sistema pueden actualizar ciudades.')
  )
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

  @ApiOperation(
    CommonDescriptions.delete('ciudad', [TipoUsuario.ADMIN_SISTEMA], 
    'Desactiva una ciudad del sistema. La ciudad no se elimina físicamente sino que se marca como inactiva para mantener integridad referencial. Solo administradores del sistema pueden desactivar ciudades.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async desactivarCiudad(@Param('id', ParseIntPipe) id: number) {
    const ciudad = await this.ciudadesService.desactivarCiudad(id);
    return ciudad;
  }
}
