import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ResolucionesAntService } from './resoluciones-ant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { CreateResolucionAntDto, UpdateResolucionAntDto, FiltroResolucionAntDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroResolucionAntBuild } from './utils/filtro-resolucion-ant-build';

@ApiTags('resoluciones-ant')
@ApiBearerAuth()
@Controller('resoluciones-ant')
export class ResolucionesAntController {
  constructor(private readonly resolucionesAntService: ResolucionesAntService) {}

  @ApiOperation(
    CommonDescriptions.getAll('resoluciones ANT', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todas las resoluciones de la Agencia Nacional de Tránsito. Incluye información de habilitaciones, permisos y regulaciones vigentes.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerResoluciones(@Query() filtro: FiltroResolucionAntDto) {
    const resoluciones = await this.resolucionesAntService.obtenerResoluciones(
      filtroResolucionAntBuild(filtro),
    );
    return resoluciones;
  }

  @ApiOperation(
    CommonDescriptions.getById('resolución ANT', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de una resolución ANT específica. Incluye número, fecha, vigencia y contenido.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerResolucionPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.resolucionesAntService.obtenerResolucion({ id });
  }

  @ApiOperation(
    CommonDescriptions.create('resolución ANT', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Crea una nueva resolución ANT en el sistema. Registra habilitaciones, permisos y documentos regulatorios oficiales.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearResolucion(@Body() createResolucionAntDto: CreateResolucionAntDto) {
    const resolucion = await this.resolucionesAntService.crearResolucion(
      createResolucionAntDto,
    );
    return resolucion;
  }

  @ApiOperation(
    CommonDescriptions.update('resolución ANT', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Actualiza una resolución ANT existente. Permite modificar información de vigencia, contenido y estado de la resolución.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id')
  async actualizarResolucion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResolucionAntDto: UpdateResolucionAntDto,
  ) {
    return await this.resolucionesAntService.actualizarResolucion(
      id,
      updateResolucionAntDto,
    );
  }

  @ApiOperation(
    CommonDescriptions.changeState('resolución ANT', 'INACTIVA', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Desactiva una resolución ANT. Las resoluciones inactivas no se consideran vigentes para operaciones.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id/desactivar')
  async desactivarResolucion(@Param('id', ParseIntPipe) id: number) {
    return await this.resolucionesAntService.desactivarResolucion(id);
  }

  @ApiOperation(
    CommonDescriptions.changeState('resolución ANT', 'ACTIVA', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Activa una resolución ANT. Las resoluciones activas se consideran vigentes para las operaciones de transporte.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id/activar')
  async activarResolucion(@Param('id', ParseIntPipe) id: number) {
    return await this.resolucionesAntService.activarResolucion(id);
  }
} 