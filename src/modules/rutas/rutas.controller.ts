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
  ForbiddenException,
} from '@nestjs/common';
import { RutasService } from './rutas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { CreateRutaDto, UpdateRutaDto, FiltroRutaDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroRutaBuild } from './utils/filtro-ruta-build';

@ApiTags('rutas')
@ApiBearerAuth()
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @ApiOperation(
    CommonDescriptions.getAll('rutas', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todas las rutas de la cooperativa actual con información de ciudades origen/destino, precios y estado.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerRutas(
    @Query() filtro: FiltroRutaDto,
    @TenantActual() tenantActual,
  ) {
    const rutas = await this.rutasService.obtenerRutas(
      filtroRutaBuild(filtro, tenantActual.id),
    );
    return rutas;
  }

  @ApiOperation(
    CommonDescriptions.getPublic('rutas', 
    'Lista todas las rutas disponibles de todas las cooperativas. Endpoint público útil para mostrar destinos disponibles en aplicaciones cliente.')
  )
  @Get('publico')
  async obtenerRutasPublico(@Query() filtro: FiltroRutaDto) {
    const rutas = await this.rutasService.obtenerRutas(filtroRutaBuild(filtro));
    return rutas;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener rutas de una cooperativa específica',
      description: 'Lista todas las rutas de una cooperativa específica. Endpoint público que permite consultar destinos por cooperativa.',
      isPublic: true,
    })
  )
  @Get('cooperativa/:idCooperativa')
  async obtenerRutasDeUnaCooperativaPublico(
    @Param('idCooperativa', ParseIntPipe) idCooperativa: number,
  ) {
    const rutas = await this.rutasService.obtenerRutas({
      tenantId: idCooperativa,
    });
    return rutas;
  }

  @ApiOperation(
    CommonDescriptions.getPublic('ruta específica', 
    'Obtiene los detalles completos de una ruta por su ID. Incluye información de ciudades, precios, distancia y paradas.')
  )
  @Get('publico/:id')
  async obtenerRutaPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.rutasService.obtenerRuta({ id });
  }

  @ApiOperation(
    CommonDescriptions.getById('ruta', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de una ruta de la cooperativa actual. Verifica permisos antes de mostrar la información.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerRutaPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const ruta = await this.rutasService.obtenerRuta({ id });

    if (ruta.tenantId !== tenantActual.id) {
      throw new ForbiddenException('No tienes permisos para ver esta ruta');
    }

    return ruta;
  }

  @ApiOperation(
    CommonDescriptions.create('ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Crea una nueva ruta en la cooperativa. Requiere ciudades origen/destino, precio base y configuración de paradas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearRuta(
    @Body() createRutaDto: CreateRutaDto,
    @TenantActual() tenantActual,
  ) {
    const ruta = await this.rutasService.crearRuta(tenantActual.id, createRutaDto);
    return ruta;
  }

  @ApiOperation(
    CommonDescriptions.update('ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Actualiza una ruta existente. Permite modificar precios, paradas, distancia y otros parámetros de la ruta.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRutaDto: UpdateRutaDto,
    @TenantActual() tenantActual,
  ) {
    const ruta = await this.rutasService.obtenerRuta({ id });
    if (ruta.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar esta ruta',
      );
    }

    return await this.rutasService.actualizarRuta(
      id,
      tenantActual.id,
      updateRutaDto,
    );
  }

  @ApiOperation(
    CommonDescriptions.changeState('ruta', 'INACTIVA', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Desactiva una ruta. Las rutas inactivas no se mostrarán en búsquedas públicas ni se podrán asignar a nuevos viajes.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/desactivar')
  async desactivarRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const ruta = await this.rutasService.obtenerRuta({ id });
    if (ruta.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para cambiar el estado de esta ruta',
      );
    }

    return await this.rutasService.desactivarRuta(id);
  }

  @ApiOperation(
    CommonDescriptions.changeState('ruta', 'ACTIVA', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Activa una ruta. Las rutas activas estarán disponibles para búsquedas públicas y asignación de viajes.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/activar')
  async activarRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const ruta = await this.rutasService.obtenerRuta({ id });
    if (ruta.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para cambiar el estado de esta ruta',
      );
    }

    return await this.rutasService.activarRuta(id);
  }
} 