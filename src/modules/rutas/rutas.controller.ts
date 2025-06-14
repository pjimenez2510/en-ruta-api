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
import { filtroRutaBuild } from './utils/filtro-ruta-build';

@ApiTags('rutas')
@ApiBearerAuth()
@Controller('rutas')
export class RutasController {
  constructor(private readonly rutasService: RutasService) {}

  @ApiOperation({
    summary: 'Obtener todas las rutas de la cooperativa actual',
  })
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

  @ApiOperation({
    summary:
      'Obtener todas las rutas de todas las cooperativas (Público)',
  })
  @Get('publico')
  async obtenerRutasPublico(@Query() filtro: FiltroRutaDto) {
    const rutas = await this.rutasService.obtenerRutas(filtroRutaBuild(filtro));
    return rutas;
  }

  @ApiOperation({
    summary:
      'Obtener todas las rutas de una cooperativa específica (Público)',
  })
  @Get('cooperativa/:idCooperativa')
  async obtenerRutasDeUnaCooperativaPublico(
    @Param('idCooperativa', ParseIntPipe) idCooperativa: number,
  ) {
    const rutas = await this.rutasService.obtenerRutas({
      tenantId: idCooperativa,
    });
    return rutas;
  }

  @ApiOperation({
    summary: 'Obtener ruta por ID (público)',
  })
  @Get('publico/:id')
  async obtenerRutaPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.rutasService.obtenerRuta({ id });
  }

  @ApiOperation({
    summary: 'Obtener ruta por ID de la cooperativa actual',
  })
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

  @ApiOperation({ summary: 'Crear nueva ruta' })
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

  @ApiOperation({ summary: 'Actualizar ruta' })
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

  @ApiOperation({ summary: 'Desactivar ruta' })
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

  @ApiOperation({ summary: 'Activar ruta' })
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