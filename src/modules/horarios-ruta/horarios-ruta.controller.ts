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
import { HorariosRutaService } from './horarios-ruta.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateHorarioRutaDto,
  UpdateHorarioRutaDto,
  FiltroHorarioRutaDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroHorarioRutaBuild } from './utils/filtro-horario-ruta-build';

@ApiTags('horarios-ruta')
@ApiBearerAuth()
@Controller('horarios-ruta')
export class HorariosRutaController {
  constructor(private readonly horariosRutaService: HorariosRutaService) {}

  @ApiOperation({
    summary: 'Obtener todos los horarios de ruta de la cooperativa actual',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerHorariosRuta(
    @Query() filtro: FiltroHorarioRutaDto,
    @TenantActual() tenantActual,
  ) {
    const horariosRuta = await this.horariosRutaService.obtenerHorariosRuta(
      filtroHorarioRutaBuild(filtro, tenantActual.id),
      undefined,
      filtro,
    );
    return horariosRuta;
  }

  @ApiOperation({
    summary:
      'Obtener todos los horarios de ruta de todas las cooperativas (Público)',
  })
  @Get('publico')
  async obtenerHorariosRutaPublico(@Query() filtro: FiltroHorarioRutaDto) {
    const horariosRuta = await this.horariosRutaService.obtenerHorariosRuta(
      filtroHorarioRutaBuild(filtro),
      undefined,
      filtro,
    );
    return horariosRuta;
  }

  @ApiOperation({
    summary: 'Obtener horarios de ruta de una cooperativa específica (Público)',
  })
  @Get('cooperativa/:idCooperativa')
  async obtenerHorariosRutaDeUnaCooperativaPublico(
    @Param('idCooperativa', ParseIntPipe) idCooperativa: number,
    @Query() filtro: FiltroHorarioRutaDto,
  ) {
    const horariosRuta = await this.horariosRutaService.obtenerHorariosRuta(
      filtroHorarioRutaBuild(filtro, idCooperativa),
      undefined,
      filtro,
    );
    return horariosRuta;
  }

  @ApiOperation({
    summary: 'Obtener horario de ruta por ID (público)',
  })
  @Get('publico/:id')
  async obtenerHorarioRutaPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.horariosRutaService.obtenerHorarioRuta({ id });
  }

  @ApiOperation({
    summary: 'Obtener horario de ruta por ID de la cooperativa actual',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerHorarioRutaPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.horariosRutaService.obtenerHorarioRuta({
      id,
      ruta: { tenantId: tenantActual.id },
    });
  }

  @ApiOperation({ summary: 'Crear nuevo horario de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearHorarioRuta(
    @Body() createHorarioRutaDto: CreateHorarioRutaDto,
    @TenantActual() tenantActual,
  ) {
    const horarioRuta = await this.horariosRutaService.crearHorarioRuta(createHorarioRutaDto, tenantActual.id);
    return horarioRuta;
  }

  @ApiOperation({ summary: 'Actualizar horario de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarHorarioRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioRutaDto: UpdateHorarioRutaDto,
    @TenantActual() tenantActual,
  ) {
    return await this.horariosRutaService.actualizarHorarioRuta(
      id,
      updateHorarioRutaDto,
      tenantActual.id,
    );
  }

  @ApiOperation({ summary: 'Desactivar horario de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/desactivar')
  async desactivarHorarioRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.horariosRutaService.desactivarHorarioRuta(id, tenantActual.id);
  }

  @ApiOperation({ summary: 'Activar horario de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/activar')
  async activarHorarioRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {

    return await this.horariosRutaService.activarHorarioRuta(id, tenantActual.id);
  }

  @ApiOperation({ summary: 'Eliminar horario de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarHorarioRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {

    return await this.horariosRutaService.eliminarHorarioRuta(id, tenantActual.id);
  }
}
