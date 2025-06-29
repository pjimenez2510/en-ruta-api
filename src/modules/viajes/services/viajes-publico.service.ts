import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FiltroViajePublicoDto } from '../dto/filtro-viaje-publico.dto';
import { VIAJE_SELECT_WITH_RELATIONS_WITH_PARADAS } from '../constants/viaje-select';

@Injectable()
export class ViajesPublicoService {
  constructor(private prisma: PrismaService) {}


  private async obtenerViajesConOrigenYDestino(
    ciudadOrigenId: number,
    ciudadDestinoId: number,
    whereConditions: Prisma.ViajeWhereInput,
  ) {
    const rutasValidas = await this.prisma.ruta.findMany({
      where: {
        AND: [
          {
            paradas: {
              some: {
                ciudadId: ciudadOrigenId,
              },
            },
          },
          {
            paradas: {
              some: {
                ciudadId: ciudadDestinoId,
              },
            },
          },
        ],
      },
      include: {
        paradas: {
          where: {
            OR: [
              { ciudadId: ciudadOrigenId },
              { ciudadId: ciudadDestinoId },
            ],
          },
          orderBy: { orden: 'asc' },
        },
        tipoRutaBus: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    const rutaIdsValidas = rutasValidas
      .filter((ruta) => {
        const paradaOrigen = ruta.paradas.find(p => p.ciudadId === ciudadOrigenId);
        const paradaDestino = ruta.paradas.find(p => p.ciudadId === ciudadDestinoId);
        
        // Validar que ambas paradas existan y que destino esté después de origen
        return paradaOrigen && 
               paradaDestino && 
               paradaDestino.orden > paradaOrigen.orden;
      })
      .map((ruta) => ruta.id);

    if (rutaIdsValidas.length === 0) {
      return [];
    }

    const nuevasCondiciones = {
      ...whereConditions,
      horarioRuta: {
        rutaId: {
          in: rutaIdsValidas,
        },
      },
    };

    return this.prisma.viaje.findMany({
      where: nuevasCondiciones,
      select: VIAJE_SELECT_WITH_RELATIONS_WITH_PARADAS,
      orderBy: [
        { fecha: 'asc' },
        { horarioRuta: { horaSalida: 'asc' } },
      ],
    });
  }

  
  async obtenerViajesConSegmentos(
    filtro?: Partial<FiltroViajePublicoDto>,
  ) {
    const viajes = await this.obtenerViajesConOrigenYDestino(
      filtro.ciudadOrigenId,
      filtro.ciudadDestinoId,
      this.construirFiltrosBasicos(filtro),
    );

    // Enriquecer con información de segmento (precio y tiempo entre paradas)
    return viajes.map((viaje: any) => {
      const paradas = viaje.horarioRuta.ruta.paradas;
      const paradaOrigen = paradas.find((p: any) => p.ciudad.id === filtro.ciudadOrigenId);
      const paradaDestino = paradas.find((p: any) => p.ciudad.id === filtro.ciudadDestinoId);

      if (paradaOrigen && paradaDestino) {
        const precioSegmento = paradaDestino.precioAcumulado - paradaOrigen.precioAcumulado;
        const tiempoSegmento = paradaDestino.tiempoAcumulado - paradaOrigen.tiempoAcumulado;

        return {
          ...viaje,
          precio: precioSegmento,
          tiempoViaje: tiempoSegmento,
          tipoRuta: viaje.horarioRuta.ruta.tipoRutaBus,
        };
      }

      return {
        ...viaje,
        tipoRuta: viaje.horarioRuta.ruta.tipoRutaBus,
      };
    });
  }

  private construirFiltrosBasicos(filtro: FiltroViajePublicoDto): Prisma.ViajeWhereInput {
    const {
      ciudadOrigenId,
      ciudadDestinoId,
      cooperativaId,
      ...filtrosBasicos
    } = filtro;

    const whereConditions: Prisma.ViajeWhereInput = {};

    if (cooperativaId) whereConditions.tenantId = cooperativaId;
    if (filtrosBasicos.horarioRutaId) whereConditions.horarioRutaId = filtrosBasicos.horarioRutaId;
    if (filtrosBasicos.busId) whereConditions.busId = filtrosBasicos.busId;
    if (filtrosBasicos.conductorId) whereConditions.conductorId = filtrosBasicos.conductorId;
    if (filtrosBasicos.ayudanteId) whereConditions.ayudanteId = filtrosBasicos.ayudanteId;
    if (filtrosBasicos.estado) whereConditions.estado = filtrosBasicos.estado;
    if (filtrosBasicos.generacion) whereConditions.generacion = filtrosBasicos.generacion;

    if (filtrosBasicos.fecha) {
      whereConditions.fecha = new Date(filtrosBasicos.fecha);
    } else if (filtrosBasicos.fechaDesde || filtrosBasicos.fechaHasta) {
      whereConditions.fecha = {};
      if (filtrosBasicos.fechaDesde) whereConditions.fecha.gte = new Date(filtrosBasicos.fechaDesde);
      if (filtrosBasicos.fechaHasta) whereConditions.fecha.lte = new Date(filtrosBasicos.fechaHasta);
    }

    return whereConditions;
  }
} 