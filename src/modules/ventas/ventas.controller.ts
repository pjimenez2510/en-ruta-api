import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { DescuentoCalculatorService } from './services/descuento-calculator.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario, EstadoPago } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { CreateVentaDto, UpdateVentaDto, FiltroVentaDto } from './dto';
import { DescuentoAplicableDto } from './dto/consulta-descuento.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { filtroVentaBuild } from './utils/filtro-venta-build';
import {
  createApiOperation,
  CommonDescriptions,
} from '../../common/utils/swagger-descriptions.util';

@ApiTags('ventas')
@ApiBearerAuth()
@Controller('ventas')
export class VentasController {
  constructor(
    private readonly ventasService: VentasService,
    private readonly descuentoCalculatorService: DescuentoCalculatorService,
  ) {}

  @ApiOperation(
    CommonDescriptions.getAll(
      'ventas',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
        RolUsuario.AYUDANTE,
      ],
      'Lista todas las ventas realizadas en la cooperativa con filtros por fecha, estado de pago, cliente, etc. Incluye información de boletos asociados.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
  )
  @Get()
  async obtenerVentas(
    @Query() filtro: FiltroVentaDto,
    @TenantActual() tenantActual,
  ) {
    const ventas = await this.ventasService.obtenerVentas(
      filtroVentaBuild(filtro, tenantActual.id),
    );
    return ventas;
  }

  @ApiOperation(
    CommonDescriptions.getById(
      'venta',
      [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
      'Obtiene los detalles completos de una venta específica incluyendo todos los boletos generados, información del cliente y estado de pago.',
    ),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerVentaPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const venta = await this.ventasService.obtenerVenta({
      id,
      tenantId: tenantActual.id,
    });
    return venta;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Crear nueva venta (procesamiento completo)',
      description:
        'Procesa una venta completa generando automáticamente los boletos correspondientes. Valida disponibilidad de asientos, calcula precios con descuentos aplicables y crea los registros necesarios.',
      roles: [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
      ],
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearVenta(
    @Body() createVentaDto: CreateVentaDto,
    @UsuarioActual() usuarioActual,
    @TenantActual() tenantActual,
  ) {
    const venta = await this.ventasService.crearVenta(
      createVentaDto,
      usuarioActual.id,
      tenantActual.id,
    );
    return venta;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Comprar boletos como cliente',
      description:
        'Permite a un cliente autenticado comprar boletos directamente. El sistema valida automáticamente la disponibilidad, aplica descuentos correspondientes y genera los boletos con códigos de acceso únicos.',
      roles: [TipoUsuario.CLIENTE],
    }),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.CLIENTE)
  @Post('comprar')
  @HttpCode(HttpStatus.CREATED)
  async comprarBoletos(
    @Body() createVentaDto: CreateVentaDto,
    @UsuarioActual() usuarioActual,
  ) {
    // Para clientes, el viaje debe ser del tenant al que pertenece el viaje
    // Validamos que el viaje exista primero para obtener el tenantId
    const viaje = await this.ventasService['prisma'].viaje.findUnique({
      where: { id: createVentaDto.viajeId },
      select: { tenantId: true },
    });

    if (!viaje) {
      throw new ForbiddenException('Viaje no encontrado');
    }

    const venta = await this.ventasService.crearVenta(
      {
        ...createVentaDto,
        oficinistaId: undefined, // Los clientes no pueden asignar oficinista
      },
      usuarioActual.id,
      viaje.tenantId,
    );
    return venta;
  }

  @ApiOperation({
    summary: 'Actualizar estado de venta',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Put(':id')
  async actualizarVenta(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVentaDto: UpdateVentaDto,
    @TenantActual() tenantActual,
  ) {
    const venta = await this.ventasService.actualizarEstadoVenta(
      id,
      updateVentaDto,
      tenantActual.id,
    );
    return venta;
  }

  @ApiOperation({
    summary:
      'Confirmar pago de venta el cliente solo puede confirmar cuando hace el pago por paypal',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    TipoUsuario.CLIENTE,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
  )
  @Patch(':id/confirmar')
  async confirmarPago(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const venta = await this.ventasService.confirmarPago(id, tenantActual.id);
    return venta;
  }

  @ApiOperation({
    summary: 'Cancelar venta',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Patch(':id/cancelar')
  async cancelarVenta(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const venta = await this.ventasService.cancelarVenta(id, tenantActual.id);
    return venta;
  }

  @ApiOperation({
    summary: 'Cambiar estado a VERIFICANDO',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Patch(':id/verificar')
  async verificarPago(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const venta = await this.ventasService.actualizarEstadoVenta(
      id,
      { estadoPago: EstadoPago.VERIFICANDO },
      tenantActual.id,
    );
    return venta;
  }

  @ApiOperation({
    summary: 'Rechazar pago de venta',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Patch(':id/rechazar')
  async rechazarPago(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const venta = await this.ventasService.actualizarEstadoVenta(
      id,
      { estadoPago: EstadoPago.RECHAZADO },
      tenantActual.id,
    );
    return venta;
  }

  @ApiOperation({
    summary: 'Obtener estadísticas de ventas',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('estadisticas/resumen')
  @ApiQuery({ name: 'fechaDesde', required: false, type: Date })
  @ApiQuery({ name: 'fechaHasta', required: false, type: Date })
  async obtenerEstadisticasVentas(
    @TenantActual() tenantActual,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const desde = fechaDesde ? new Date(fechaDesde) : undefined;
    const hasta = fechaHasta ? new Date(fechaHasta) : undefined;

    const estadisticas = await this.ventasService.obtenerEstadisticasVentas(
      tenantActual.id,
      desde,
      hasta,
    );
    return estadisticas;
  }

  @ApiOperation({
    summary: 'Obtener mis ventas (cliente autenticado)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.CLIENTE)
  @Get('mis-compras/cliente')
  async obtenerMisVentas(
    @Query() filtro: FiltroVentaDto,
    @UsuarioActual() usuarioActual,
  ) {
    const ventas = await this.ventasService.obtenerVentas(
      filtroVentaBuild({ ...filtro, usuarioId: usuarioActual.id }),
    );
    return ventas;
  }

  @ApiOperation({
    summary: 'Consultar descuentos aplicables para un cliente específico',
    description:
      'Calcula automáticamente qué descuentos se aplicarían a un cliente basándose en su edad, discapacidad y configuraciones del tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del descuento aplicable',
    type: DescuentoAplicableDto,
  })
  @UseGuards(JwtAuthGuard)
  @Get('descuentos/cliente/:clienteId')
  async consultarDescuentosCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @TenantActual() tenantActual,
  ): Promise<DescuentoAplicableDto> {
    const informacionDescuento =
      await this.descuentoCalculatorService.calcularDescuentoAutomatico(
        clienteId,
        tenantActual.id,
      );

    const validacion =
      await this.descuentoCalculatorService.validarRequisitosDescuento(
        clienteId,
        informacionDescuento.tipoDescuento,
      );

    return {
      ...informacionDescuento,
      validacion,
      mensaje: `Descuento aplicable: ${informacionDescuento.descripcion}`,
    };
  }
}
