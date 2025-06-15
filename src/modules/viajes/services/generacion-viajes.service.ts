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

    if (buses.length < horariosRuta.length) {
      throw new BadRequestException(
        `Se necesitan al menos ${horariosRuta.length} buses para cubrir ${horariosRuta.length} horarios de ruta. Actualmente tienes ${buses.length} buses disponibles.`,
      );
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

      if (buses.length < horariosRuta.length) {
        throw new BadRequestException(
          `Se necesitan al menos ${horariosRuta.length} buses para cubrir ${horariosRuta.length} horarios de ruta. Actualmente tienes ${buses.length} buses disponibles.`,
        );
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
      timeout: 15000, // Aumentar timeout a 15 segundos
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
      },
      orderBy: { numero: 'asc' },
    });
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

    const horariosOrdenados = [...horariosRuta].sort((a, b) => {
      if (a.ruta.nombre !== b.ruta.nombre) {
        return a.ruta.nombre.localeCompare(b.ruta.nombre);
      }
      return a.horaSalida.localeCompare(b.horaSalida);
    });

    // Arrays para recopilar viajes
    const viajesParaCrear: any[] = [];
    const viajesParaPrevisualizar: ViajeGeneradoDto[] = [];

    // Generar matriz de viajes
    for (let indiceFecha = 0; indiceFecha < fechas.length; indiceFecha++) {
      const fecha = fechas[indiceFecha];
      const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay(); 
      const posicionDia = diaSemana - 1; 

      for (let indiceHorario = 0; indiceHorario < horariosOrdenados.length; indiceHorario++) {
        const horario = horariosOrdenados[indiceHorario];

        if (horario.diasSemana && horario.diasSemana[posicionDia] === '1') {
          // Calcular bus asignado con rotación
          const indiceBusRotado = (indiceHorario + indiceFecha) % buses.length;
          const busAsignado = buses[indiceBusRotado];

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
