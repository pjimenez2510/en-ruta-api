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
import { filtroParadaRutaBuild } from './utils/filtro-parada-ruta-build';

@ApiTags('paradas-ruta')
@ApiBearerAuth()
@Controller('paradas-ruta')
export class ParadasRutaController {
  constructor(private readonly paradasRutaService: ParadasRutaService) {}

  @ApiOperation({
    summary: 'Obtener todas las paradas de ruta de la cooperativa actual',
  })
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

  @ApiOperation({
    summary: 'Obtener todas las paradas de ruta (Público)',
  })
  @Get('publico')
  async obtenerParadasRutaPublico(@Query() filtro: FiltroParadaRutaDto) {
    const paradasRuta = await this.paradasRutaService.obtenerParadasRuta(
      filtroParadaRutaBuild(filtro),
    );
    return paradasRuta;
  }

  @ApiOperation({
    summary: 'Obtener paradas de una ruta específica (Público)',
  })
  @Get('publico/ruta/:rutaId')
  async obtenerParadasPorRutaPublico(
    @Param('rutaId', ParseIntPipe) rutaId: number,
  ) {
    return await this.paradasRutaService.obtenerParadasPorRuta(rutaId);
  }

  @ApiOperation({
    summary: 'Obtener parada de ruta por ID (público)',
  })
  @Get('publico/:id')
  async obtenerParadaRutaPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.paradasRutaService.obtenerParadaRuta({ id });
  }

  @ApiOperation({
    summary: 'Obtener parada de ruta por ID de la cooperativa actual',
  })
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

  @ApiOperation({
    summary: 'Obtener paradas de una ruta específica de la cooperativa actual',
  })
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

  @ApiOperation({ summary: 'Crear nueva parada de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Actualizar parada de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Eliminar parada de ruta' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarParadaRuta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.paradasRutaService.eliminarParadaRuta(id, tenantActual.id);
  }
} 