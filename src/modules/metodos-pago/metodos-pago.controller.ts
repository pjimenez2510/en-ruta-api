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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroMetodoPagoBuild } from './utils/filtro-metodo-pago-build';

@ApiTags('metodos-pago')
@ApiBearerAuth()
@Controller('metodos-pago')
export class MetodosPagoController {
  constructor(private readonly metodosPagoService: MetodosPagoService) {}

  @ApiOperation(
    CommonDescriptions.getAll('métodos de pago', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Lista todos los métodos de pago de la cooperativa actual. Incluye efectivo, tarjetas, transferencias y otros medios habilitados.')
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic('métodos de pago activos', 
    'Lista todos los métodos de pago activos disponibles. Endpoint público útil para mostrar opciones de pago en aplicaciones cliente.')
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener métodos de pago de una cooperativa específica',
      description: 'Lista los métodos de pago activos de una cooperativa específica. Endpoint público que permite consultar opciones de pago por cooperativa.',
      isPublic: true,
    })
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic('método de pago específico', 
    'Obtiene los detalles de un método de pago por su ID. Incluye información de comisiones, límites y configuraciones.')
  )
  @Get('publico/:id')
  async obtenerMetodoPagoPublico(@Param('id', ParseIntPipe) id: number) {
    return await this.metodosPagoService.obtenerMetodoPago({ id });
  }

  @ApiOperation(
    CommonDescriptions.getById('método de pago', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de un método de pago de la cooperativa actual.')
  )
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

  @ApiOperation(
    CommonDescriptions.create('método de pago', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Crea un nuevo método de pago. Define tipos de pago, comisiones, límites y configuraciones específicas para la cooperativa.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
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

  @ApiOperation(
    CommonDescriptions.update('método de pago', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Actualiza un método de pago existente. Permite modificar comisiones, límites, estado y configuraciones operativas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
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

  @ApiOperation(
    CommonDescriptions.changeState('método de pago', 'INACTIVO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Desactiva un método de pago. Los métodos inactivos no estarán disponibles para nuevas ventas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
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

  @ApiOperation(
    CommonDescriptions.changeState('método de pago', 'ACTIVO', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Activa un método de pago. Los métodos activos estarán disponibles para usar en ventas.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
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

  @ApiOperation(
    CommonDescriptions.delete('método de pago', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Elimina un método de pago del sistema. CUIDADO: Esta acción puede afectar ventas existentes que usen este método.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
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