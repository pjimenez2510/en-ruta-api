import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { BoletosService } from './boletos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario, EstadoBoleto } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import { FiltroBoletoDto, UpdateBoletoDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroBoletoBuilder } from './utils/filtro-boleto-build';

@ApiTags('boletos')
@ApiBearerAuth()
@Controller('boletos')
export class BoletosController {
  constructor(private readonly boletosService: BoletosService) {}

  @ApiOperation(
    CommonDescriptions.getAll('boletos', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
      RolUsuario.CONDUCTOR,
      RolUsuario.AYUDANTE,
    ], 'Lista todos los boletos de la cooperativa actual con filtros por viaje, cliente, estado, fecha, etc. Incluye información completa del viaje y cliente.')
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
  async obtenerBoletos(
    @Query() filtro: FiltroBoletoDto,
    @TenantActual() tenantActual,
  ) {
    const boletos = await this.boletosService.obtenerBoletos(
      filtroBoletoBuilder(filtro, tenantActual.id),
    );
    return boletos;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Buscar boletos por término de búsqueda',
      description: 'Realiza una búsqueda flexible de boletos por código, nombre del cliente, documento o información del viaje. Útil para encontrar boletos rápidamente.',
      roles: [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
        RolUsuario.AYUDANTE,
      ],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
  )
  @Get('buscar')
  @ApiQuery({ name: 'termino', description: 'Término de búsqueda' })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  async buscarBoletos(
    @Query('termino') termino: string,
    @TenantActual() tenantActual,
    @Query('limite') limite?: number,
  ) {
    const boletos = await this.boletosService.buscarBoletos(
      termino,
      tenantActual.id,
      limite ? parseInt(limite.toString()) : 10,
    );
    return boletos;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener estadísticas de boletos',
      description: 'Genera estadísticas detalladas de boletos vendidos, estados, ingresos y métricas de rendimiento para un rango de fechas específico.',
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
  @Get('estadisticas/resumen')
  @ApiQuery({ name: 'fechaDesde', required: false, type: Date })
  @ApiQuery({ name: 'fechaHasta', required: false, type: Date })
  async obtenerEstadisticasBoletos(
    @TenantActual() tenantActual,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const desde = fechaDesde ? new Date(fechaDesde) : undefined;
    const hasta = fechaHasta ? new Date(fechaHasta) : undefined;
    
    const estadisticas = await this.boletosService.obtenerEstadisticasBoletos(
      tenantActual.id,
      desde,
      hasta,
    );
    return estadisticas;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener boleto por código de acceso',
      description: 'Consulta un boleto usando su código de acceso único. Endpoint público útil para que los clientes verifiquen sus boletos.',
      isPublic: true,
    })
  )
  @Get('codigo/:codigoAcceso')
  async obtenerBoletoPorCodigo(
    @Param('codigoAcceso') codigoAcceso: string,
  ) {
    const boleto = await this.boletosService.obtenerBoletoPorCodigo(codigoAcceso);
    return boleto;
  }

  @ApiOperation(
    CommonDescriptions.getById('boleto', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Obtiene los detalles completos de un boleto específico de la cooperativa actual. Incluye información del viaje, cliente y historial de estados.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get(':id')
  async obtenerBoletoPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const boleto = await this.boletosService.obtenerBoleto({
      id,
      tenantId: tenantActual.id,
    });
    return boleto;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener boletos por viaje',
      description: 'Lista todos los boletos vendidos para un viaje específico. Útil para conductores y personal para verificar pasajeros y disponibilidad.',
      roles: [
        TipoUsuario.ADMIN_SISTEMA,
        RolUsuario.ADMIN_COOPERATIVA,
        RolUsuario.OFICINISTA,
        RolUsuario.CONDUCTOR,
        RolUsuario.AYUDANTE,
      ],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
  )
  @Get('viaje/:viajeId')
  async obtenerBoletosPorViaje(
    @Param('viajeId', ParseIntPipe) viajeId: number,
    @TenantActual() tenantActual,
  ) {
    const boletos = await this.boletosService.obtenerBoletosPorViaje(
      viajeId,
      tenantActual.id,
    );
    return boletos;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener boletos por venta',
      description: 'Lista todos los boletos generados en una venta específica. Útil para revisar detalles de una transacción completa.',
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
  @Get('venta/:ventaId')
  async obtenerBoletosPorVenta(
    @Param('ventaId', ParseIntPipe) ventaId: number,
    @TenantActual() tenantActual,
  ) {
    const boletos = await this.boletosService.obtenerBoletosPorVenta(
      ventaId,
      tenantActual.id,
    );
    return boletos;
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener boletos por cliente',
      description: 'Lista todos los boletos comprados por un cliente específico en un rango de fechas. Incluye historial completo de viajes.',
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
  @Get('cliente/:clienteId')
  @ApiQuery({ name: 'fechaDesde', required: false, type: Date })
  @ApiQuery({ name: 'fechaHasta', required: false, type: Date })
  async obtenerBoletosPorCliente(
    @Param('clienteId', ParseIntPipe) clienteId: number,
    @TenantActual() tenantActual,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const desde = fechaDesde ? new Date(fechaDesde) : undefined;
    const hasta = fechaHasta ? new Date(fechaHasta) : undefined;
    
    const boletos = await this.boletosService.obtenerBoletosPorCliente(
      clienteId,
      tenantActual.id,
      desde,
      hasta,
    );
    return boletos;
  }

  @ApiOperation(
    CommonDescriptions.update('boleto', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
    ], 'Actualiza el estado o información de un boleto. Permite cambios administrativos en boletos existentes.')
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Patch(':id')
  async actualizarBoleto(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBoletoDto: UpdateBoletoDto,
    @TenantActual() tenantActual,
  ) {
    const boleto = await this.boletosService.actualizarEstadoBoleto(
      id,
      updateBoletoDto,
      tenantActual.id,
    );
    return boleto;
  }

  @ApiOperation({
    summary: 'Confirmar boleto',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
    TipoUsuario.CLIENTE,
  )
  @Patch(':id/confirmar')
  async confirmarBoleto(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const boleto = await this.boletosService.confirmarBoleto(id, tenantActual.id);
    return boleto;
  }

  @ApiOperation({
    summary: 'Marcar boleto como abordado',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
  )
  @Patch(':id/abordar')
  async marcarComoAbordado(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const boleto = await this.boletosService.marcarComoAbordado(id, tenantActual.id);
    return boleto;
  }

  @ApiOperation({
    summary: 'Marcar boleto como no show',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
  )
  @Patch(':id/no-show')
  async marcarComoNoShow(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const boleto = await this.boletosService.marcarComoNoShow(id, tenantActual.id);
    return boleto;
  }

  @ApiOperation({
    summary: 'Validar boleto para abordaje',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
    RolUsuario.AYUDANTE,
  )
  @Get('validar/:codigoAcceso/viaje/:viajeId')
  async validarBoletoParaAbordaje(
    @Param('codigoAcceso') codigoAcceso: string,
    @Param('viajeId', ParseIntPipe) viajeId: number,
  ) {
    const boleto = await this.boletosService.validarBoletoParaAbordaje(
      codigoAcceso,
      viajeId,
    );
    return boleto;
  }

  @ApiOperation({
    summary: 'Obtener mis boletos (cliente autenticado)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.CLIENTE)
  @Get('mis-boletos/cliente')
  @ApiQuery({ name: 'fechaDesde', required: false, type: Date })
  @ApiQuery({ name: 'fechaHasta', required: false, type: Date })
  async obtenerMisBoletos(
    @UsuarioActual() usuarioActual,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    // Obtener el cliente asociado al usuario
    const usuario = await this.boletosService['prisma'].usuario.findUnique({
      where: { id: usuarioActual.id },
      include: { cliente: true },
    });

    if (!usuario?.cliente) {
      throw new ForbiddenException('Usuario no tiene un perfil de cliente asociado');
    }

    const desde = fechaDesde ? new Date(fechaDesde) : undefined;
    const hasta = fechaHasta ? new Date(fechaHasta) : undefined;
    
    // Para clientes, mostramos boletos de todos los tenants
    const boletos = await this.boletosService.obtenerBoletosPorCliente(
      usuario.cliente.id,
      undefined, // Sin filtro de tenant para clientes
      desde,
      hasta,
    );
    return boletos;
  }
} 