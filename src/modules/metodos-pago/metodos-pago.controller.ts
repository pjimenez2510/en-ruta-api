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
} from '@nestjs/common';
import { MetodosPagoService } from './metodos-pago.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  CreateMetodoPagoDto,
  UpdateMetodoPagoDto,
  FiltroMetodoPagoDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroMetodoPagoBuild } from './utils/filtro-metodo-pago-build';

@ApiTags('metodos-pago')
@ApiBearerAuth()
@Controller('metodos-pago')
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) {}

  @ApiOperation({
    summary: 'Obtener todos los métodos de pago de la cooperativa actual',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get()
  async obtenerMetodosPago(
    @Query() filtro: FiltroMetodoPagoDto,
    @TenantActual() tenantActual,
  ) {
    const metodosPago = await this.metodosPagoService.obtenerMetodosPago(
      filtroMetodoPagoBuild(filtro, tenantActual.id),
      undefined,
      filtro,
    );
    return metodosPago;
  }

  @ApiOperation({
    summary: 'Obtener todos los métodos de pago activos (Público)',
  })
  @Get('publico')
  async obtenerMetodosPagoPublico(@Query() filtro: FiltroMetodoPagoDto) {
    const filtroPublico = { ...filtro, activo: true };
    const metodosPago = await this.metodosPagoService.obtenerMetodosPago(
      filtroMetodoPagoBuild(filtroPublico),
      undefined,
      filtroPublico,
    );
    return metodosPago;
  }

  @ApiOperation({
    summary: 'Obtener métodos de pago de una cooperativa específica (Público)',
  })
  @Get('cooperativa/:idCooperativa')
  async obtenerMetodosPagoDeUnaCooperativaPublico(
    @Param('idCooperativa', ParseIntPipe) idCooperativa: number,
    @Query() filtro: FiltroMetodoPagoDto,
  ) {
    const filtroPublico = { ...filtro, activo: true };
    const metodosPago = await this.metodosPagoService.obtenerMetodosPago(
      filtroMetodoPagoBuild(filtroPublico, idCooperativa),
      undefined,
      filtroPublico,
    );
    return metodosPago;
  }

  @ApiOperation({
    summary: 'Obtener método de pago por ID (público)',
  })
  @Get('publico/:id')
  async obtenerMetodoPagoPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.metodosPagoService.obtenerMetodoPago({ id });
  }

  @ApiOperation({
    summary: 'Obtener método de pago por ID de la cooperativa actual',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerMetodoPagoPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.metodosPagoService.obtenerMetodoPago({
      id,
      tenantId: tenantActual.id,
    });
  }

  @ApiOperation({ summary: 'Crear nuevo método de pago' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearMetodoPago(
    @Body() createMetodoPagoDto: CreateMetodoPagoDto,
    @TenantActual() tenantActual,
  ) {
    const metodoPago = await this.metodosPagoService.crearMetodoPago(
      createMetodoPagoDto,
      tenantActual.id,
    );
    return metodoPago;
  }

  @ApiOperation({ summary: 'Actualizar método de pago' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarMetodoPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoPagoDto: UpdateMetodoPagoDto,
    @TenantActual() tenantActual,
  ) {
    return await this.metodosPagoService.actualizarMetodoPago(
      id,
      updateMetodoPagoDto,
      tenantActual.id,
    );
  }

  @ApiOperation({ summary: 'Desactivar método de pago' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/desactivar')
  async desactivarMetodoPago(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.metodosPagoService.desactivarMetodoPago(
      id,
      tenantActual.id,
    );
  }

  @ApiOperation({ summary: 'Activar método de pago' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id/activar')
  async activarMetodoPago(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.metodosPagoService.activarMetodoPago(
      id,
      tenantActual.id,
    );
  }

  @ApiOperation({ summary: 'Eliminar método de pago' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarMetodoPago(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    return await this.metodosPagoService.eliminarMetodoPago(
      id,
      tenantActual.id,
    );
  }
} 