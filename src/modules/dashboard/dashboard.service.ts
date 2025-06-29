import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoViaje, EstadoBus, EstadoBoleto } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private async handleDatabaseError(error: any, operation: string) {
    console.error(`Error en ${operation}:`, error.message);

    if (error.message.includes("Can't reach database server")) {
      throw new ServiceUnavailableException(
        `No se puede conectar a la base de datos. Verifique la configuración de conexión.`,
      );
    }

    throw error;
  }

  async obtenerMetricasGenerales(tenantId: number) {
    try {
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
        this.prisma.bus
          .count({ where: { tenantId } })
          .catch((e) => this.handleDatabaseError(e, 'contar buses')),
        this.prisma.bus
          .count({ where: { tenantId, estado: EstadoBus.ACTIVO } })
          .catch((e) => this.handleDatabaseError(e, 'contar buses activos')),
        this.prisma.bus
          .count({ where: { tenantId, estado: EstadoBus.MANTENIMIENTO } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar buses en mantenimiento'),
          ),

        // Rutas
        this.prisma.ruta
          .count({ where: { tenantId } })
          .catch((e) => this.handleDatabaseError(e, 'contar rutas')),
        this.prisma.ruta
          .count({ where: { tenantId, activo: true } })
          .catch((e) => this.handleDatabaseError(e, 'contar rutas activas')),

        // Viajes
        this.prisma.viaje
          .count({ where: { tenantId } })
          .catch((e) => this.handleDatabaseError(e, 'contar viajes')),
        this.prisma.viaje
          .count({ where: { tenantId, estado: EstadoViaje.PROGRAMADO } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar viajes programados'),
          ),
        this.prisma.viaje
          .count({ where: { tenantId, estado: EstadoViaje.EN_RUTA } })
          .catch((e) => this.handleDatabaseError(e, 'contar viajes en ruta')),
        this.prisma.viaje
          .count({ where: { tenantId, estado: EstadoViaje.COMPLETADO } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar viajes completados'),
          ),
        this.prisma.viaje
          .count({ where: { tenantId, estado: EstadoViaje.CANCELADO } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar viajes cancelados'),
          ),

        // Boletos
        this.prisma.boleto
          .count({ where: { tenantId } })
          .catch((e) => this.handleDatabaseError(e, 'contar boletos')),
        this.prisma.boleto
          .count({ where: { tenantId, estado: EstadoBoleto.CONFIRMADO } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar boletos confirmados'),
          ),
        this.prisma.boleto
          .count({ where: { tenantId, estado: EstadoBoleto.ABORDADO } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar boletos abordados'),
          ),
        this.prisma.boleto
          .count({ where: { tenantId, estado: EstadoBoleto.PENDIENTE } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar boletos pendientes'),
          ),

        // Ventas
        this.prisma.venta
          .count({ where: { tenantId } })
          .catch((e) => this.handleDatabaseError(e, 'contar ventas')),
        this.prisma.venta
          .count({ where: { tenantId, estadoPago: 'APROBADO' } })
          .catch((e) => this.handleDatabaseError(e, 'contar ventas aprobadas')),
        this.prisma.venta
          .count({ where: { tenantId, estadoPago: 'PENDIENTE' } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar ventas pendientes'),
          ),

        // Personal
        this.prisma.usuarioTenant
          .count({ where: { tenantId, rol: 'CONDUCTOR' } })
          .catch((e) => this.handleDatabaseError(e, 'contar conductores')),
        this.prisma.usuarioTenant
          .count({ where: { tenantId, rol: 'CONDUCTOR', activo: true } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar conductores activos'),
          ),
        this.prisma.usuarioTenant
          .count({ where: { tenantId, rol: 'AYUDANTE' } })
          .catch((e) => this.handleDatabaseError(e, 'contar ayudantes')),
        this.prisma.usuarioTenant
          .count({ where: { tenantId, rol: 'AYUDANTE', activo: true } })
          .catch((e) =>
            this.handleDatabaseError(e, 'contar ayudantes activos'),
          ),
      ]);

      return {
        buses: {
          total: totalBuses || 0,
          activos: busesActivos || 0,
          mantenimiento: busesMantenimiento || 0,
          porcentajeActivos:
            (totalBuses || 0) > 0 ? Math.round((busesActivos || 0) / (totalBuses || 0) * 100) : 0,
        },
        rutas: {
          total: totalRutas || 0,
          activas: rutasActivas || 0,
          porcentajeActivas:
            (totalRutas || 0) > 0 ? Math.round((rutasActivas || 0) / (totalRutas || 0) * 100) : 0,
        },
        viajes: {
          total: totalViajes || 0,
          programados: viajesProgramados || 0,
          enRuta: viajesEnRuta || 0,
          completados: viajesCompletados || 0,
          cancelados: viajesCancelados || 0,
          porcentajeCompletados:
            (totalViajes || 0) > 0
              ? Math.round((viajesCompletados || 0) / (totalViajes || 0) * 100)
              : 0,
        },
        boletos: {
          total: totalBoletos || 0,
          confirmados: boletosConfirmados || 0,
          abordados: boletosAbordados || 0,
          pendientes: boletosPendientes || 0,
          porcentajeConfirmados:
            (totalBoletos || 0) > 0
              ? Math.round((boletosConfirmados || 0) / (totalBoletos || 0) * 100)
              : 0,
        },
        ventas: {
          total: totalVentas || 0,
          aprobadas: ventasAprobadas || 0,
          pendientes: ventasPendientes || 0,
          porcentajeAprobadas:
            (totalVentas || 0) > 0
              ? Math.round((ventasAprobadas || 0) / (totalVentas || 0) * 100)
              : 0,
        },
        personal: {
          conductores: {
            total: totalConductores || 0,
            activos: conductoresActivos || 0,
            porcentajeActivos:
              (totalConductores || 0) > 0
                ? Math.round((conductoresActivos || 0) / (totalConductores || 0) * 100)
                : 0,
          },
          ayudantes: {
            total: totalAyudantes || 0,
            activos: ayudantesActivos || 0,
            porcentajeActivos:
              (totalAyudantes || 0) > 0
                ? Math.round((ayudantesActivos || 0) / (totalAyudantes || 0) * 100)
                : 0,
          },
        },
      };
    } catch (error) {
      await this.handleDatabaseError(error, 'obtener métricas generales');
    }
  }

  async obtenerMetricasFinancieras(tenantId: number, fechaInicio?: Date, fechaFin?: Date) {
    try {
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
      }).catch(e => this.handleDatabaseError(e, 'obtener ventas')) || [];

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
    } catch (error) {
      await this.handleDatabaseError(error, 'obtener métricas financieras');
    }
  }

  async obtenerViajesRecientes(tenantId: number, limite: number = 10) {
    try {
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
      }).catch(e => this.handleDatabaseError(e, 'obtener viajes recientes')) || [];
    } catch (error) {
      await this.handleDatabaseError(error, 'obtener viajes recientes');
    }
  }

  async obtenerBoletosRecientes(tenantId: number, limite: number = 10) {
    try {
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
      }).catch(e => this.handleDatabaseError(e, 'obtener boletos recientes')) || [];
    } catch (error) {
      await this.handleDatabaseError(error, 'obtener boletos recientes');
    }
  }

  async obtenerOcupacionPorTipoRuta(tenantId: number) {
    try {
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
      }).catch(e => this.handleDatabaseError(e, 'obtener viajes para ocupación')) || [];

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
    } catch (error) {
      await this.handleDatabaseError(error, 'obtener ocupación por tipo de ruta');
    }
  }

  async obtenerEstadisticasPorDia(tenantId: number, dias: number = 7) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);

      const [viajes, boletos] = await Promise.all([
        this.prisma.viaje.findMany({
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
        }).catch(e => this.handleDatabaseError(e, 'obtener viajes para estadísticas')) || [],
        
        this.prisma.boleto.findMany({
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
        }).catch(e => this.handleDatabaseError(e, 'obtener boletos para estadísticas')) || [],
      ]);

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
      (viajes || []).forEach(viaje => {
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
      (boletos || []).forEach(boleto => {
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
    } catch (error) {
      await this.handleDatabaseError(error, 'obtener estadísticas por día');
    }
  }
}
 