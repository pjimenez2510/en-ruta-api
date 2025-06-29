import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoViaje, EstadoBus, EstadoBoleto } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async obtenerMetricasGenerales(tenantId: number) {
    const [
      totalBuses,
      busesActivos,
      busesMantenimiento,
      totalRutas,
      rutasActivas,
      totalViajes,
      viajesProgramados,
      viajesEnRuta,
      viajesCompletados,
      viajesCancelados,
      totalBoletos,
      boletosConfirmados,
      boletosAbordados,
      boletosPendientes,
      totalVentas,
      ventasAprobadas,
      ventasPendientes,
      totalConductores,
      conductoresActivos,
      totalAyudantes,
      ayudantesActivos,
    ] = await Promise.all([
      // Buses
      this.prisma.bus.count({ where: { tenantId } }),
      this.prisma.bus.count({ where: { tenantId, estado: EstadoBus.ACTIVO } }),
      this.prisma.bus.count({ where: { tenantId, estado: EstadoBus.MANTENIMIENTO } }),
      
      // Rutas
      this.prisma.ruta.count({ where: { tenantId } }),
      this.prisma.ruta.count({ where: { tenantId, activo: true } }),
      
      // Viajes
      this.prisma.viaje.count({ where: { tenantId } }),
      this.prisma.viaje.count({ where: { tenantId, estado: EstadoViaje.PROGRAMADO } }),
      this.prisma.viaje.count({ where: { tenantId, estado: EstadoViaje.EN_RUTA } }),
      this.prisma.viaje.count({ where: { tenantId, estado: EstadoViaje.COMPLETADO } }),
      this.prisma.viaje.count({ where: { tenantId, estado: EstadoViaje.CANCELADO } }),
      
      // Boletos
      this.prisma.boleto.count({ where: { tenantId } }),
      this.prisma.boleto.count({ where: { tenantId, estado: EstadoBoleto.CONFIRMADO } }),
      this.prisma.boleto.count({ where: { tenantId, estado: EstadoBoleto.ABORDADO } }),
      this.prisma.boleto.count({ where: { tenantId, estado: EstadoBoleto.PENDIENTE } }),
      
      // Ventas
      this.prisma.venta.count({ where: { tenantId } }),
      this.prisma.venta.count({ where: { tenantId, estadoPago: 'APROBADO' } }),
      this.prisma.venta.count({ where: { tenantId, estadoPago: 'PENDIENTE' } }),
      
      // Personal
      this.prisma.usuarioTenant.count({ where: { tenantId, rol: 'CONDUCTOR' } }),
      this.prisma.usuarioTenant.count({ where: { tenantId, rol: 'CONDUCTOR', activo: true } }),
      this.prisma.usuarioTenant.count({ where: { tenantId, rol: 'AYUDANTE' } }),
      this.prisma.usuarioTenant.count({ where: { tenantId, rol: 'AYUDANTE', activo: true } }),
    ]);

    return {
      buses: {
        total: totalBuses,
        activos: busesActivos,
        mantenimiento: busesMantenimiento,
        porcentajeActivos: totalBuses > 0 ? Math.round((busesActivos / totalBuses) * 100) : 0,
      },
      rutas: {
        total: totalRutas,
        activas: rutasActivas,
        porcentajeActivas: totalRutas > 0 ? Math.round((rutasActivas / totalRutas) * 100) : 0,
      },
      viajes: {
        total: totalViajes,
        programados: viajesProgramados,
        enRuta: viajesEnRuta,
        completados: viajesCompletados,
        cancelados: viajesCancelados,
        porcentajeCompletados: totalViajes > 0 ? Math.round((viajesCompletados / totalViajes) * 100) : 0,
      },
      boletos: {
        total: totalBoletos,
        confirmados: boletosConfirmados,
        abordados: boletosAbordados,
        pendientes: boletosPendientes,
        porcentajeConfirmados: totalBoletos > 0 ? Math.round((boletosConfirmados / totalBoletos) * 100) : 0,
      },
      ventas: {
        total: totalVentas,
        aprobadas: ventasAprobadas,
        pendientes: ventasPendientes,
        porcentajeAprobadas: totalVentas > 0 ? Math.round((ventasAprobadas / totalVentas) * 100) : 0,
      },
      personal: {
        conductores: {
          total: totalConductores,
          activos: conductoresActivos,
          porcentajeActivos: totalConductores > 0 ? Math.round((conductoresActivos / totalConductores) * 100) : 0,
        },
        ayudantes: {
          total: totalAyudantes,
          activos: ayudantesActivos,
          porcentajeActivos: totalAyudantes > 0 ? Math.round((ayudantesActivos / totalAyudantes) * 100) : 0,
        },
      },
    };
  }

  async obtenerMetricasFinancieras(tenantId: number, fechaInicio?: Date, fechaFin?: Date) {
    const whereCondition: any = { tenantId };
    
    if (fechaInicio && fechaFin) {
      whereCondition.fechaVenta = {
        gte: fechaInicio,
        lte: fechaFin,
      };
    }

    const ventas = await this.prisma.venta.findMany({
      where: whereCondition,
      select: {
        totalSinDescuento: true,
        totalDescuentos: true,
        totalFinal: true,
        estadoPago: true,
        fechaVenta: true,
      },
    });

    const totalIngresos = ventas
      .filter(v => v.estadoPago === 'APROBADO')
      .reduce((sum, v) => sum + v.totalFinal.toNumber(), 0);

    const totalDescuentos = ventas
      .filter(v => v.estadoPago === 'APROBADO')
      .reduce((sum, v) => sum + v.totalDescuentos.toNumber(), 0);

    const ventasPorDia = ventas.reduce((acc, venta) => {
      const fecha = venta.fechaVenta.toISOString().split('T')[0];
      if (!acc[fecha]) {
        acc[fecha] = {
          ingresos: 0,
          ventas: 0,
        };
      }
      if (venta.estadoPago === 'APROBADO') {
        acc[fecha].ingresos += venta.totalFinal.toNumber();
      }
      acc[fecha].ventas += 1;
      return acc;
    }, {} as Record<string, { ingresos: number; ventas: number }>);

    return {
      totalIngresos,
      totalDescuentos,
      promedioVenta: ventas.length > 0 ? totalIngresos / ventas.length : 0,
      totalVentas: ventas.length,
      ventasAprobadas: ventas.filter(v => v.estadoPago === 'APROBADO').length,
      ventasPorDia: Object.entries(ventasPorDia).map(([fecha, datos]) => ({
        fecha,
        ingresos: datos.ingresos,
        ventas: datos.ventas,
      })),
    };
  }

  async obtenerViajesRecientes(tenantId: number, limite: number = 10) {
    return await this.prisma.viaje.findMany({
      where: { tenantId },
      select: {
        id: true,
        fecha: true,
        estado: true,
        capacidadTotal: true,
        asientosOcupados: true,
        horarioRuta: {
          select: {
            horaSalida: true,
            ruta: {
              select: {
                nombre: true,
                tipoRutaBus: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
        bus: {
          select: {
            numero: true,
            placa: true,
          },
        },
        conductor: {
          select: {
            infoPersonal: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: limite,
    });
  }

  async obtenerBoletosRecientes(tenantId: number, limite: number = 10) {
    return await this.prisma.boleto.findMany({
      where: { tenantId },
      select: {
        id: true,
        codigoAcceso: true,
        estado: true,
        precioFinal: true,
        fechaViaje: true,
        cliente: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
        viaje: {
          select: {
            horarioRuta: {
              select: {
                ruta: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
      take: limite,
    });
  }

  async obtenerOcupacionPorTipoRuta(tenantId: number) {
    const viajes = await this.prisma.viaje.findMany({
      where: { tenantId },
      select: {
        capacidadTotal: true,
        asientosOcupados: true,
        horarioRuta: {
          select: {
            ruta: {
              select: {
                tipoRutaBus: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const ocupacionPorTipo = viajes.reduce((acc, viaje) => {
      const tipoRuta = viaje.horarioRuta.ruta.tipoRutaBus;
      const tipoId = tipoRuta.id;
      
      if (!acc[tipoId]) {
        acc[tipoId] = {
          nombre: tipoRuta.nombre,
          capacidadTotal: 0,
          asientosOcupados: 0,
          viajes: 0,
        };
      }
      
      acc[tipoId].capacidadTotal += viaje.capacidadTotal;
      acc[tipoId].asientosOcupados += viaje.asientosOcupados;
      acc[tipoId].viajes += 1;
      
      return acc;
    }, {} as Record<number, { nombre: string; capacidadTotal: number; asientosOcupados: number; viajes: number }>);

    return Object.values(ocupacionPorTipo).map(tipo => ({
      ...tipo,
      porcentajeOcupacion: tipo.capacidadTotal > 0 ? Math.round((tipo.asientosOcupados / tipo.capacidadTotal) * 100) : 0,
    }));
  }

  async obtenerEstadisticasPorDia(tenantId: number, dias: number = 7) {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const viajes = await this.prisma.viaje.findMany({
      where: {
        tenantId,
        fecha: {
          gte: fechaInicio,
        },
      },
      select: {
        fecha: true,
        estado: true,
        asientosOcupados: true,
        capacidadTotal: true,
      },
    });

    const boletos = await this.prisma.boleto.findMany({
      where: {
        tenantId,
        fechaViaje: {
          gte: fechaInicio,
        },
      },
      select: {
        fechaViaje: true,
        estado: true,
        precioFinal: true,
      },
    });

    const estadisticasPorDia = new Map<string, {
      fecha: string;
      viajes: number;
      viajesCompletados: number;
      boletos: number;
      ingresos: number;
      ocupacionPromedio: number;
    }>();

    // Inicializar días
    for (let i = 0; i < dias; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      estadisticasPorDia.set(fechaStr, {
        fecha: fechaStr,
        viajes: 0,
        viajesCompletados: 0,
        boletos: 0,
        ingresos: 0,
        ocupacionPromedio: 0,
      });
    }

    // Procesar viajes
    viajes.forEach(viaje => {
      const fechaStr = viaje.fecha.toISOString().split('T')[0];
      const stats = estadisticasPorDia.get(fechaStr);
      if (stats) {
        stats.viajes += 1;
        if (viaje.estado === EstadoViaje.COMPLETADO) {
          stats.viajesCompletados += 1;
        }
        if (viaje.capacidadTotal > 0) {
          stats.ocupacionPromedio += (viaje.asientosOcupados / viaje.capacidadTotal) * 100;
        }
      }
    });

    // Procesar boletos
    boletos.forEach(boleto => {
      const fechaStr = boleto.fechaViaje.toISOString().split('T')[0];
      const stats = estadisticasPorDia.get(fechaStr);
      if (stats) {
        stats.boletos += 1;
        if (boleto.estado === EstadoBoleto.CONFIRMADO) {
          stats.ingresos += boleto.precioFinal.toNumber();
        }
      }
    });

    // Calcular promedios
    estadisticasPorDia.forEach(stats => {
      if (stats.viajes > 0) {
        stats.ocupacionPromedio = Math.round(stats.ocupacionPromedio / stats.viajes);
      }
    });

    return Array.from(estadisticasPorDia.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
} 