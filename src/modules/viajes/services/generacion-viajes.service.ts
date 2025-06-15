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
    const viajesGenerados: ViajeGeneradoDto[] = [];
    const prismaClient = tx || this.prisma;

    const fechas: Date[] = [];
    const fechaActual = new Date(datos.fechaInicio);
    const fechaFin = new Date(datos.fechaFin);

    while (fechaActual <= fechaFin) {
      fechas.push(new Date(fechaActual));
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

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

    const horariosOrdenados = [...horariosRuta].sort((a, b) => {
      if (a.ruta.nombre !== b.ruta.nombre) {
        return a.ruta.nombre.localeCompare(b.ruta.nombre);
      }
      return a.horaSalida.localeCompare(b.horaSalida);
    });

    for (let indiceFecha = 0; indiceFecha < fechas.length; indiceFecha++) {
      const fecha = fechas[indiceFecha];
      const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay(); 
      const posicionDia = diaSemana - 1; 

      for (let indiceHorario = 0; indiceHorario < horariosOrdenados.length; indiceHorario++) {
        const horario = horariosOrdenados[indiceHorario];

        if (horario.diasSemana && horario.diasSemana[posicionDia] === '1') {
          
          const indiceBusRotado = (indiceHorario + indiceFecha) % buses.length;
          const busAsignado = buses[indiceBusRotado];

          const yaExiste = viajesExistentes.some(
            (ve) =>
              ve.fecha.getTime() === fecha.getTime() &&
              ve.horarioRutaId === horario.id &&
              ve.busId === busAsignado.id,
          );

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

          if (!guardar) {
            viajesGenerados.push(viajeGenerado);
            continue;
          }


          if (guardar && !yaExiste) {
            const viajeCreado = await prismaClient.viaje.create({
              data: {
                tenantId,
                horarioRutaId: horario.id,
                busId: busAsignado.id,
                fecha,
                estado: EstadoViaje.PROGRAMADO,
                capacidadTotal: busAsignado.totalAsientos,
                asientosOcupados: 0,
                generacion: TipoGeneracion.AUTOMATICA,
              },
              select: {
                ...VIAJE_SELECT_WITH_RELATIONS,
              }
            });
            viajesGenerados.push(viajeCreado as unknown as ViajeGeneradoDto);
          }

          
        }
      }
    }

    return viajesGenerados.sort((a, b) => {
      if (a.fecha.getTime() !== b.fecha.getTime()) {
        return a.fecha.getTime() - b.fecha.getTime();
      }
      if (a.horarioRuta.ruta.nombre !== b.horarioRuta.ruta.nombre) {
        return a.horarioRuta.ruta.nombre.localeCompare(b.horarioRuta.ruta.nombre);
      }

      return a.horarioRuta.horaSalida.localeCompare(b.horarioRuta.horaSalida);
    });
  }


}
