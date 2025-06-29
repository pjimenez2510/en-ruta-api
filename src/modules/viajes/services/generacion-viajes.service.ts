import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GenerarViajesDto,
  ViajeGeneradoDto,
} from '../dto';
import { EstadoViaje, TipoGeneracion, Prisma } from '@prisma/client';
import { VIAJE_SELECT_WITH_RELATIONS } from '../constants/viaje-select';

@Injectable()
export class GeneracionViajesService {
  constructor(private prisma: PrismaService) {}

  async previsualizarGeneracion(
    datos: GenerarViajesDto,
    tenantId: number,
  ): Promise<ViajeGeneradoDto[]> {
    if (datos.fechaInicio > datos.fechaFin) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser mayor a la fecha de fin',
      );
    }

    const diffTiempo = datos.fechaFin.getTime() - datos.fechaInicio.getTime();
    const diffDias = Math.ceil(diffTiempo / (1000 * 3600 * 24));

    if (diffDias > 90) {
      throw new BadRequestException(
        'El rango de fechas no puede ser mayor a 90 días',
      );
    }

    const horariosRuta = await this.obtenerHorariosRuta(
      tenantId,
      datos.rutaIds,
    );

    if (horariosRuta.length === 0) {
      throw new NotFoundException(
        'No se encontraron horarios de ruta activos para generar viajes',
      );
    }

    const buses = await this.obtenerBusesDisponibles(tenantId, datos.busIds);

    if (buses.length === 0) {
      throw new NotFoundException(
        'No se encontraron buses disponibles para generar viajes',
      );
    }

    // Agrupar buses por tipo de ruta
    const busesPorTipo = this.agruparBusesPorTipo(buses);
    const horariosPorTipo = this.agruparHorariosPorTipo(horariosRuta);

    // Verificar que cada tipo tenga buses suficientes
    for (const [tipoRutaId, horarios] of horariosPorTipo.entries()) {
      const busesDelTipo = busesPorTipo.get(tipoRutaId) || [];
      if (busesDelTipo.length < horarios.length) {
        const tipoRuta = await this.prisma.tipoRutaBus.findUnique({
          where: { id: tipoRutaId },
          select: { nombre: true }
        });
        throw new BadRequestException(
          `Se necesitan al menos ${horarios.length} buses del tipo "${tipoRuta?.nombre}" para cubrir ${horarios.length} horarios de ruta. Actualmente tienes ${busesDelTipo.length} buses disponibles.`,
        );
      }
    }

    const viajesGenerados = await this.generarMatrizViajesConRotacionDiaria(
      datos,
      horariosRuta,
      buses,
      tenantId,
      false, 
    );

    return viajesGenerados;
  }

  async generarYGuardarViajes(
    datos: GenerarViajesDto,
    tenantId: number,
  ): Promise<ViajeGeneradoDto[]> {
    return await this.prisma.$transaction(async (tx) => {
      if (datos.fechaInicio > datos.fechaFin) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser mayor a la fecha de fin',
        );
      }

      const horariosRuta = await this.obtenerHorariosRuta(
        tenantId,
        datos.rutaIds,
      );

      if (horariosRuta.length === 0) {
        throw new NotFoundException(
          'No se encontraron horarios de ruta activos para generar viajes',
        );
      }

      const buses = await this.obtenerBusesDisponibles(tenantId, datos.busIds);

      if (buses.length === 0) {
        throw new NotFoundException(
          'No se encontraron buses disponibles para generar viajes',
        );
      }

      // Agrupar buses por tipo de ruta
      const busesPorTipo = this.agruparBusesPorTipo(buses);
      const horariosPorTipo = this.agruparHorariosPorTipo(horariosRuta);

      // Verificar que cada tipo tenga buses suficientes
      for (const [tipoRutaId, horarios] of horariosPorTipo.entries()) {
        const busesDelTipo = busesPorTipo.get(tipoRutaId) || [];
        if (busesDelTipo.length < horarios.length) {
          const tipoRuta = await this.prisma.tipoRutaBus.findUnique({
            where: { id: tipoRutaId },
            select: { nombre: true }
          });
          throw new BadRequestException(
            `Se necesitan al menos ${horarios.length} buses del tipo "${tipoRuta?.nombre}" para cubrir ${horarios.length} horarios de ruta. Actualmente tienes ${busesDelTipo.length} buses disponibles.`,
          );
        }
      }

      const viajesGenerados = await this.generarMatrizViajesConRotacionDiaria(
        datos,
        horariosRuta,
        buses,
        tenantId,
        true, 
        tx,
      );

      return viajesGenerados;
    }, {
      timeout: 30000, // Aumentar timeout a 15 segundos
    });
  }

  private async obtenerHorariosRuta(tenantId: number, rutaIds?: number[]) {
    const where: Prisma.HorarioRutaWhereInput = {
      activo: true,
      ruta: {
        tenantId,
        activo: true,
      },
    };

    if (rutaIds && rutaIds.length > 0) {
      where.rutaId = { in: rutaIds };
    }

    return await this.prisma.horarioRuta.findMany({
      where,
      select: {
        id: true,
        rutaId: true,
        horaSalida: true,
        diasSemana: true,
        ruta: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            tipoRutaBusId: true,
            tipoRutaBus: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: [{ ruta: { nombre: 'asc' } }, { horaSalida: 'asc' }],
    });
  }

  private async obtenerBusesDisponibles(tenantId: number, busIds?: number[]) {
    const where: Prisma.BusWhereInput = {
      tenantId,
      estado: 'ACTIVO',
    };

    if (busIds && busIds.length > 0) {
      where.id = { in: busIds };
    }

    return await this.prisma.bus.findMany({
      where,
      select: {
        id: true,
        numero: true,
        placa: true,
        totalAsientos: true,
        tipoRutaBusId: true,
        tipoRutaBus: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { numero: 'asc' },
    });
  }

  private agruparBusesPorTipo(buses: any[]): Map<number, any[]> {
    const busesPorTipo = new Map<number, any[]>();
    
    for (const bus of buses) {
      const tipoRutaId = bus.tipoRutaBusId;
      if (!busesPorTipo.has(tipoRutaId)) {
        busesPorTipo.set(tipoRutaId, []);
      }
      busesPorTipo.get(tipoRutaId)!.push(bus);
    }
    
    return busesPorTipo;
  }

  private agruparHorariosPorTipo(horarios: any[]): Map<number, any[]> {
    const horariosPorTipo = new Map<number, any[]>();
    
    for (const horario of horarios) {
      const tipoRutaId = horario.ruta.tipoRutaBusId;
      if (!horariosPorTipo.has(tipoRutaId)) {
        horariosPorTipo.set(tipoRutaId, []);
      }
      horariosPorTipo.get(tipoRutaId)!.push(horario);
    }
    
    return horariosPorTipo;
  }

  private async generarMatrizViajesConRotacionDiaria(
    datos: GenerarViajesDto,
    horariosRuta: any[],
    buses: any[],
    tenantId: number,
    guardar: boolean = false,
    tx?: Prisma.TransactionClient,
  ): Promise<ViajeGeneradoDto[]> {
    const prismaClient = tx || this.prisma;

    // Generar array de fechas
    const fechas: Date[] = [];
    const fechaActual = new Date(datos.fechaInicio);
    const fechaFin = new Date(datos.fechaFin);

    while (fechaActual <= fechaFin) {
      fechas.push(new Date(fechaActual));
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    // Obtener viajes existentes para evitar duplicados
    const viajesExistentes = await prismaClient.viaje.findMany({
      where: {
        tenantId,
        fecha: {
          gte: datos.fechaInicio,
          lte: datos.fechaFin,
        },
        horarioRutaId: {
          in: horariosRuta.map((h) => h.id),
        },
      },
      select: {
        fecha: true,
        horarioRutaId: true,
        busId: true,
      },
    });

    // Crear un Set para búsqueda rápida de viajes existentes
    const viajesExistentesSet = new Set(
      viajesExistentes.map(
        (ve) => `${ve.fecha.getTime()}-${ve.horarioRutaId}-${ve.busId}`
      )
    );

    // Agrupar por tipo de ruta
    const busesPorTipo = this.agruparBusesPorTipo(buses);
    const horariosPorTipo = this.agruparHorariosPorTipo(horariosRuta);

    // Arrays para recopilar viajes
    const viajesParaCrear: any[] = [];
    const viajesParaPrevisualizar: ViajeGeneradoDto[] = [];

    // Generar matriz de viajes por tipo
    for (const [tipoRutaId, horariosDelTipo] of horariosPorTipo.entries()) {
      const busesDelTipo = busesPorTipo.get(tipoRutaId) || [];
      
      // Ordenar horarios del tipo
      const horariosOrdenados = [...horariosDelTipo].sort((a, b) => {
        if (a.ruta.nombre !== b.ruta.nombre) {
          return a.ruta.nombre.localeCompare(b.ruta.nombre);
        }
        return a.horaSalida.localeCompare(b.horaSalida);
      });

      // Generar viajes para cada fecha
      for (let indiceFecha = 0; indiceFecha < fechas.length; indiceFecha++) {
        const fecha = fechas[indiceFecha];
        const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay(); 
        const posicionDia = diaSemana - 1; 

        // Generar viajes para cada horario del tipo
        for (let indiceHorario = 0; indiceHorario < horariosOrdenados.length; indiceHorario++) {
          const horario = horariosOrdenados[indiceHorario];

          if (horario.diasSemana && horario.diasSemana[posicionDia] === '1') {
            // Calcular bus asignado con rotación (solo dentro del mismo tipo)
            const indiceBusRotado = (indiceHorario + indiceFecha) % busesDelTipo.length;
            const busAsignado = busesDelTipo[indiceBusRotado];

            // Verificar si ya existe
            const claveViaje = `${fecha.getTime()}-${horario.id}-${busAsignado.id}`;
            const yaExiste = viajesExistentesSet.has(claveViaje);

            if (!guardar) {
              // Modo previsualización
              const viajeGenerado: ViajeGeneradoDto = {
                id: null,
                conductorId: null,
                ayudanteId: null,
                horaSalidaReal: null,
                observaciones: null,
                estado: EstadoViaje.PROGRAMADO,
                capacidadTotal: busAsignado.totalAsientos,
                generacion: TipoGeneracion.AUTOMATICA,
                tenantId,
                fecha,
                horarioRuta: {
                  id: horario.id,
                  horaSalida: horario.horaSalida,
                  ruta: horario.ruta,
                },
                bus: busAsignado,
              };
              viajesParaPrevisualizar.push(viajeGenerado);
            } else if (!yaExiste) {
              // Modo guardar - recopilar para inserción masiva
              viajesParaCrear.push({
                tenantId,
                horarioRutaId: horario.id,
                busId: busAsignado.id,
                fecha,
                estado: EstadoViaje.PROGRAMADO,
                capacidadTotal: busAsignado.totalAsientos,
                asientosOcupados: 0,
                generacion: TipoGeneracion.AUTOMATICA,
              });
            }
          }
        }
      }
    }

    // Si es previsualización, retornar los viajes generados
    if (!guardar) {
      return viajesParaPrevisualizar.sort((a, b) => {
        if (a.fecha.getTime() !== b.fecha.getTime()) {
          return a.fecha.getTime() - b.fecha.getTime();
        }
        if (a.horarioRuta.ruta.nombre !== b.horarioRuta.ruta.nombre) {
          return a.horarioRuta.ruta.nombre.localeCompare(b.horarioRuta.ruta.nombre);
        }
        return a.horarioRuta.horaSalida.localeCompare(b.horarioRuta.horaSalida);
      });
    }

    // Inserción masiva de viajes
    if (viajesParaCrear.length > 0) {
      // Procesar por lotes para evitar problemas con muchos registros
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < viajesParaCrear.length; i += BATCH_SIZE) {
        const batch = viajesParaCrear.slice(i, i + BATCH_SIZE);
        await prismaClient.viaje.createMany({
          data: batch,
          skipDuplicates: true,
        });
      }

      // Obtener los viajes creados con sus relaciones
      const viajesCreados = await prismaClient.viaje.findMany({
        where: {
          tenantId,
          fecha: {
            gte: datos.fechaInicio,
            lte: datos.fechaFin,
          },
          horarioRutaId: {
            in: horariosRuta.map((h) => h.id),
          },
          busId: {
            in: buses.map((b) => b.id),
          },
          generacion: TipoGeneracion.AUTOMATICA,
        },
        select: {
          ...VIAJE_SELECT_WITH_RELATIONS,
        },
        orderBy: [
          { fecha: 'asc' },
          { horarioRuta: { ruta: { nombre: 'asc' } } },
          { horarioRuta: { horaSalida: 'asc' } },
        ],
      });

      return viajesCreados as unknown as ViajeGeneradoDto[];
    }

    // Si no hay viajes para crear, retornar array vacío
    return [];
  }
}
