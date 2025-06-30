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
import { ParadasRutaService } from './paradas-ruta.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { CreateParadaRutaDto, UpdateParadaRutaDto, FiltroParadaRutaDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroParadaRutaBuild } from './utils/filtro-parada-ruta-build';

@ApiTags('paradas-ruta')
@ApiBearerAuth()
@Controller('paradas-ruta')
export class ParadasRutaController {
  constructor(private readonly paradasRutaService: ParadasRutaService) {}

  @ApiOperation(
    CommonDescriptions.getAll('paradas de ruta', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todas las paradas de ruta de la cooperativa actual. Incluye ubicación, orden y configuraciones de cada parada.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerParadasRuta(
    @Query() filtro: FiltroParadaRutaDto,
    @TenantActual() tenantActual,
  ) {
    const paradasRuta = await this.paradasRutaService.obtenerParadasRuta(
      filtroParadaRutaBuild(filtro, tenantActual.id),
    );
    return paradasRuta;
  }

  @ApiOperation(
    CommonDescriptions.getPublic('paradas de ruta', 
    'Lista todas las paradas de ruta disponibles. Endpoint público útil para mostrar paradas y ubicaciones en aplicaciones cliente.')
  )
  @Get('publico')
  async obtenerParadasRutaPublico(@Query() filtro: FiltroParadaRutaDto) {
    const paradasRuta = await this.paradasRutaService.obtenerParadasRuta(
      filtroParadaRutaBuild(filtro),
    );
    return paradasRuta;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener paradas de una ruta específica',
      description: 'Lista todas las paradas de una ruta específica en orden secuencial. Endpoint público útil para mostrar el recorrido completo de una ruta.',
      isPublic: true,
    })
  )
  @Get('publico/ruta/:rutaId')
  async obtenerParadasPorRutaPublico(
    @Param('rutaId', ParseIntPipe) rutaId: number,
  ) {
    return await this.paradasRutaService.obtenerParadasPorRuta(rutaId);
  }

  @ApiOperation(
    CommonDescriptions.getPublic('parada de ruta específica', 
    'Obtiene los detalles de una parada de ruta por su ID. Incluye ubicación, horarios estimados y información de la ciudad.')
  )
  @Get('publico/:id')
  async obtenerParadaRutaPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.paradasRutaService.obtenerParadaRuta({ id });
  }

  @ApiOperation(
    CommonDescriptions.getById('parada de ruta', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de una parada de ruta de la cooperativa actual.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerParadaRutaPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const paradaRuta = await this.paradasRutaService.obtenerParadaRuta({ id, ruta: { tenantId: tenantActual.id } });

    return paradaRuta;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener paradas de una ruta de la cooperativa',
      description: 'Lista todas las paradas de una ruta específica de la cooperativa actual en orden secuencial. Incluye información detallada de cada parada.',
      roles: [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('ruta/:rutaId')
  async obtenerParadasPorRuta(
    @Param('rutaId', ParseIntPipe) rutaId: number,
    @TenantActual() tenantActual,
  ) {
    return await this.paradasRutaService.obtenerParadasPorRuta(rutaId, tenantActual.id);
  }

  @ApiOperation(
    CommonDescriptions.create('parada de ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Crea una nueva parada en una ruta. Define la ubicación, orden secuencial y configuraciones específicas de la parada.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearParadaRuta(
    @Body() createParadaRutaDto: CreateParadaRutaDto,
    @TenantActual() tenantActual,
  ) {
    const paradaRuta = await this.paradasRutaService.crearParadaRuta(
      createParadaRutaDto,
      tenantActual.id,
    );
    return paradaRuta;
  }

  @ApiOperation(
    CommonDescriptions.update('parada de ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Actualiza una parada de ruta existente. Permite modificar ubicación, orden, horarios estimados y configuraciones.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Put(':id')
  async actualizarParadaRuta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParadaRutaDto: UpdateParadaRutaDto,
    @TenantActual() tenantActual,
  ) {
    return await this.paradasRutaService.actualizarParadaRuta(
      id,
      updateParadaRutaDto,
      tenantActual.id,
    );
  }

  @ApiOperation(
    CommonDescriptions.delete('parada de ruta', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Elimina una parada de ruta del sistema. CUIDADO: Esta acción puede afectar viajes existentes que usen esta ruta.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Delete(':id')
  async eliminarParadaRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.paradasRutaService.eliminarParadaRuta(id, tenantActual.id);
  }
} 