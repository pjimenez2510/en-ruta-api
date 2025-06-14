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
import { filtroResolucionAntBuild } from './utils/filtro-resolucion-ant-build';

@ApiTags('resoluciones-ant')
@ApiBearerAuth()
@Controller('resoluciones-ant')
export class ResolucionesAntController {
  constructor(private readonly resolucionesAntService: ResolucionesAntService) {}

  @ApiOperation({
    summary: 'Obtener todas las resoluciones ANT',
  })
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

  @ApiOperation({
    summary: 'Obtener resolución ANT por ID',
  })
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

  @ApiOperation({ summary: 'Crear nueva resolución ANT' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearResolucion(@Body() createResolucionAntDto: CreateResolucionAntDto) {
    const resolucion = await this.resolucionesAntService.crearResolucion(
      createResolucionAntDto,
    );
    return resolucion;
  }

  @ApiOperation({ summary: 'Actualizar resolución ANT' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
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

  @ApiOperation({ summary: 'Desactivar resolución ANT' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/desactivar')
  async desactivarResolucion(@Param('id', ParseIntPipe) id: number) {
    return await this.resolucionesAntService.desactivarResolucion(id);
  }

  @ApiOperation({ summary: 'Activar resolución ANT' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/activar')
  async activarResolucion(@Param('id', ParseIntPipe) id: number) {
    return await this.resolucionesAntService.activarResolucion(id);
  }
} 