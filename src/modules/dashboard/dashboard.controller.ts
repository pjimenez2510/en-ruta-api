import {
  Controller,
  Get,
  UseGuards,
  Query,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener métricas generales del dashboard',
      description: 'Retorna métricas generales de la cooperativa incluyendo estadísticas de buses, rutas, viajes, boletos, ventas y personal.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('metricas-generales')
  async obtenerMetricasGenerales(@TenantActual() tenantActual) {
    return await this.dashboardService.obtenerMetricasGenerales(tenantActual.id);
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener métricas financieras',
      description: 'Retorna métricas financieras incluyendo ingresos, descuentos, promedio de ventas y ventas por día.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @ApiQuery({
    name: 'fechaInicio',
    required: false,
    description: 'Fecha de inicio para filtrar (YYYY-MM-DD)',
    type: String,
  })
  @ApiQuery({
    name: 'fechaFin',
    required: false,
    description: 'Fecha de fin para filtrar (YYYY-MM-DD)',
    type: String,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('metricas-financieras')
  async obtenerMetricasFinancieras(
    @TenantActual() tenantActual,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;
    
    return await this.dashboardService.obtenerMetricasFinancieras(
      tenantActual.id,
      fechaInicioDate,
      fechaFinDate,
    );
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener viajes recientes',
      description: 'Retorna los viajes más recientes de la cooperativa con información detallada.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA, RolUsuario.CONDUCTOR],
    })
  )
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Número máximo de viajes a retornar',
    type: Number,
    example: 10,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    RolUsuario.CONDUCTOR,
  )
  @Get('viajes-recientes')
  async obtenerViajesRecientes(
    @TenantActual() tenantActual,
    @Query('limite') limite?: string,
  ) {
    const limiteNum = limite ? parseInt(limite) : 10;
    return await this.dashboardService.obtenerViajesRecientes(tenantActual.id, limiteNum);
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener boletos recientes',
      description: 'Retorna los boletos más recientes de la cooperativa con información del cliente y viaje.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @ApiQuery({
    name: 'limite',
    required: false,
    description: 'Número máximo de boletos a retornar',
    type: Number,
    example: 10,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('boletos-recientes')
  async obtenerBoletosRecientes(
    @TenantActual() tenantActual,
    @Query('limite') limite?: string,
  ) {
    const limiteNum = limite ? parseInt(limite) : 10;
    return await this.dashboardService.obtenerBoletosRecientes(tenantActual.id, limiteNum);
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener ocupación por tipo de ruta',
      description: 'Retorna estadísticas de ocupación agrupadas por tipo de ruta de bus.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('ocupacion-por-tipo-ruta')
  async obtenerOcupacionPorTipoRuta(@TenantActual() tenantActual) {
    return await this.dashboardService.obtenerOcupacionPorTipoRuta(tenantActual.id);
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener estadísticas por día',
      description: 'Retorna estadísticas diarias de viajes, boletos, ingresos y ocupación promedio.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @ApiQuery({
    name: 'dias',
    required: false,
    description: 'Número de días hacia atrás para obtener estadísticas',
    type: Number,
    example: 7,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('estadisticas-por-dia')
  async obtenerEstadisticasPorDia(
    @TenantActual() tenantActual,
    @Query('dias') dias?: string,
  ) {
    const diasNum = dias ? parseInt(dias) : 7;
    return await this.dashboardService.obtenerEstadisticasPorDia(tenantActual.id, diasNum);
  }

  @ApiOperation(
    createApiOperation({
      summary: 'Obtener resumen completo del dashboard',
      description: 'Retorna un resumen completo con todas las métricas principales del dashboard en una sola llamada.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA],
    })
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('resumen-completo')
  async obtenerResumenCompleto(@TenantActual() tenantActual) {
    const [
      metricasGenerales,
      metricasFinancieras,
      viajesRecientes,
      boletosRecientes,
      ocupacionPorTipoRuta,
      estadisticasPorDia,
    ] = await Promise.all([
      this.dashboardService.obtenerMetricasGenerales(tenantActual.id),
      this.dashboardService.obtenerMetricasFinancieras(tenantActual.id),
      this.dashboardService.obtenerViajesRecientes(tenantActual.id, 5),
      this.dashboardService.obtenerBoletosRecientes(tenantActual.id, 5),
      this.dashboardService.obtenerOcupacionPorTipoRuta(tenantActual.id),
      this.dashboardService.obtenerEstadisticasPorDia(tenantActual.id, 7),
    ]);

    return {
      metricasGenerales,
      metricasFinancieras,
      viajesRecientes,
      boletosRecientes,
      ocupacionPorTipoRuta,
      estadisticasPorDia,
      timestamp: new Date().toISOString(),
    };
  }
} 