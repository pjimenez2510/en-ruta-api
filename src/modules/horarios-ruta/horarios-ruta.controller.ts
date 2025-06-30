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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroHorarioRutaBuild } from './utils/filtro-horario-ruta-build';

@ApiTags('horarios-ruta')
@ApiBearerAuth()
@Controller('horarios-ruta')
export class HorariosRutaController {
  constructor(private readonly horariosRutaService: HorariosRutaService) {}

  @ApiOperation(
    CommonDescriptions.getAll('horarios de ruta', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todos los horarios de ruta de la cooperativa actual. Incluye horarios de salida, llegada, frecuencias y días de operación.')
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic('horarios de ruta', 
    'Lista todos los horarios de ruta de todas las cooperativas. Endpoint público útil para mostrar horarios disponibles en aplicaciones cliente.')
  )
  @Get('publico')
  async obtenerHorariosRutaPublico(@Query() filtro: FiltroHorarioRutaDto) {
    const horariosRuta = await this.horariosRutaService.obtenerHorariosRuta(
      filtroHorarioRutaBuild(filtro),
      undefined,
      filtro,
    );
    return horariosRuta;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener horarios de una cooperativa específica',
      description: 'Lista los horarios de ruta de una cooperativa específica. Endpoint público que permite consultar horarios por cooperativa.',
      isPublic: true,
    })
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic('horario de ruta específico', 
    'Obtiene los detalles completos de un horario de ruta por su ID. Incluye horarios, frecuencias y configuraciones.')
  )
  @Get('publico/:id')
  async obtenerHorarioRutaPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.horariosRutaService.obtenerHorarioRuta({ id });
  }

  @ApiOperation(
    CommonDescriptions.getById('horario de ruta', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de un horario de ruta de la cooperativa actual.')
  )
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

  @ApiOperation(
    CommonDescriptions.create('horario de ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Crea un nuevo horario de ruta. Define los horarios de salida, llegada y configuraciones de frecuencia para una ruta específica.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearHorarioRuta(
    @Body() createHorarioRutaDto: CreateHorarioRutaDto,
    @TenantActual() tenantActual,
  ) {
    const horarioRuta = await this.horariosRutaService.crearHorarioRuta(createHorarioRutaDto, tenantActual.id);
    return horarioRuta;
  }

  @ApiOperation(
    CommonDescriptions.update('horario de ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Actualiza un horario de ruta existente. Permite modificar horarios, frecuencias y configuraciones operativas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
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

  @ApiOperation(
    CommonDescriptions.changeState('horario de ruta', 'INACTIVO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Desactiva un horario de ruta. Los horarios inactivos no se usarán para la generación automática de viajes.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id/desactivar')
  async desactivarHorarioRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.horariosRutaService.desactivarHorarioRuta(id, tenantActual.id);
  }

  @ApiOperation(
    CommonDescriptions.changeState('horario de ruta', 'ACTIVO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Activa un horario de ruta. Los horarios activos se usarán para la generación automática de viajes.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id/activar')
  async activarHorarioRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {

    return await this.horariosRutaService.activarHorarioRuta(id, tenantActual.id);
  }

  @ApiOperation(
    CommonDescriptions.delete('horario de ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Elimina un horario de ruta del sistema. CUIDADO: Esta acción puede afectar la generación de viajes automáticos.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Delete(':id')
  async eliminarHorarioRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {

    return await this.horariosRutaService.eliminarHorarioRuta(id, tenantActual.id);
  }
}
