import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateUbicacionAsientoPlantillaDto,
  UpdateUbicacionAsientoPlantillaDto,
} from './dto';
import { UBICACION_ASIENTO_PLANTILLA_SELECT } from './constants/ubicacion-asiento-plantilla-select';

@Injectable()
export class UbicacionAsientoPlantillasService {
  constructor(private prisma: PrismaService) {}

  async obtenerUbicacionesAsientoPlantilla({
    filtro,
    args = UBICACION_ASIENTO_PLANTILLA_SELECT,
    tx,
  }: {
    filtro: Prisma.UbicacionAsientoPlantillaWhereInput;
    args?: Prisma.UbicacionAsientoPlantillaSelect;
    tx?: Prisma.TransactionClient;
  }) {
    return await (tx || this.prisma).ubicacionAsientoPlantilla.findMany({
      where: filtro,
      orderBy: [
        { plantillaPisoId: 'asc' },
        { fila: 'asc' },
        { columna: 'asc' },
      ],
      select: args,
    });
  }

  async obtenerUbicacionAsientoPlantilla({
    filtro,
    args = UBICACION_ASIENTO_PLANTILLA_SELECT,
    tx,
  }: {
    filtro: Prisma.UbicacionAsientoPlantillaWhereUniqueInput;
    args?: Prisma.UbicacionAsientoPlantillaSelect;
    tx?: Prisma.TransactionClient;
  }) {
    const ubicacion = await (
      tx || this.prisma
    ).ubicacionAsientoPlantilla.findUnique({
      where: filtro,
      select: args,
    });

    if (!ubicacion) {
      throw new NotFoundException(
        `Ubicación de asiento con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return ubicacion;
  }

  async crearUbicacionAsientoPlantilla(
    datos: CreateUbicacionAsientoPlantillaDto,
    tx?: Prisma.TransactionClient,
  ) {
    // Verificar si la plantilla de piso existe
    const plantillaPiso = await (tx || this.prisma).plantillaPiso.findUnique({
      where: { id: datos.plantillaPisoId },
    });

    if (!plantillaPiso) {
      throw new NotFoundException(
        `No se encontró la plantilla de piso con ID ${datos.plantillaPisoId}`,
      );
    }

    // Verificar si la ubicación ya existe en la plantilla
    const existente = await (
      tx || this.prisma
    ).ubicacionAsientoPlantilla.findUnique({
      where: {
        plantillaPisoId_fila_columna: {
          plantillaPisoId: datos.plantillaPisoId,
          fila: datos.fila,
          columna: datos.columna,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una ubicación de asiento en la posición (${datos.fila}, ${datos.columna}) para la plantilla de piso con ID ${datos.plantillaPisoId}`,
      );
    }

    // Validar que la fila y columna estén dentro de los límites de la plantilla
    if (
      datos.fila >= plantillaPiso.filas ||
      datos.columna >= plantillaPiso.columnas
    ) {
      throw new ConflictException(
        `La posición (${datos.fila}, ${datos.columna}) está fuera de los límites de la plantilla (${plantillaPiso.filas}x${plantillaPiso.columnas})`,
      );
    }

    return await (tx || this.prisma).ubicacionAsientoPlantilla.create({
      data: {
        ...datos,
      },
      select: UBICACION_ASIENTO_PLANTILLA_SELECT,
    });
  }

  async actualizarUbicacionAsientoPlantilla(
    id: number,
    datos: UpdateUbicacionAsientoPlantillaDto,
    tx?: Prisma.TransactionClient,
  ) {
    const ubicacionActual = await this.obtenerUbicacionAsientoPlantilla({
      filtro: { id },
      tx,
    });

    if (
      datos.plantillaPisoId !== undefined ||
      datos.fila !== undefined ||
      datos.columna !== undefined
    ) {
      const plantillaPisoId =
        datos.plantillaPisoId !== undefined
          ? datos.plantillaPisoId
          : ubicacionActual.plantillaPisoId;
      const fila = datos.fila !== undefined ? datos.fila : ubicacionActual.fila;
      const columna =
        datos.columna !== undefined ? datos.columna : ubicacionActual.columna;

      if (
        plantillaPisoId !== ubicacionActual.plantillaPisoId ||
        fila !== ubicacionActual.fila ||
        columna !== ubicacionActual.columna
      ) {
        const existente = await (
          tx || this.prisma
        ).ubicacionAsientoPlantilla.findUnique({
          where: {
            plantillaPisoId_fila_columna: {
              plantillaPisoId,
              fila,
              columna,
            },
          },
        });

        if (existente && existente.id !== id) {
          throw new ConflictException(
            `Ya existe una ubicación de asiento en la posición (${fila}, ${columna}) para la plantilla de piso con ID ${plantillaPisoId}`,
          );
        }

        if (
          datos.plantillaPisoId !== undefined ||
          datos.fila !== undefined ||
          datos.columna !== undefined
        ) {
          const plantilla = await (tx || this.prisma).plantillaPiso.findUnique({
            where: { id: plantillaPisoId },
          });

          if (!plantilla) {
            throw new NotFoundException(
              `No se encontró la plantilla de piso con ID ${plantillaPisoId}`,
            );
          }

          if (fila >= plantilla.filas || columna >= plantilla.columnas) {
            throw new ConflictException(
              `La posición (${fila}, ${columna}) está fuera de los límites de la plantilla (${plantilla.filas}x${plantilla.columnas})`,
            );
          }
        }
      }
    }

    return await (tx || this.prisma).ubicacionAsientoPlantilla.update({
      where: { id },
      data: datos,
      select: UBICACION_ASIENTO_PLANTILLA_SELECT,
    });
  }

  async eliminarUbicacionAsientoPlantilla(
    id: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerUbicacionAsientoPlantilla({ filtro: { id }, tx });

    return await (tx || this.prisma).ubicacionAsientoPlantilla.delete({
      where: { id },
      select: UBICACION_ASIENTO_PLANTILLA_SELECT,
    });
  }

  async cambiarEstadoUbicacionAsientoPlantilla(
    id: number,
    estaHabilitado: boolean,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerUbicacionAsientoPlantilla({ filtro: { id }, tx });

    return await (tx || this.prisma).ubicacionAsientoPlantilla.update({
      where: { id },
      data: { estaHabilitado },
      select: UBICACION_ASIENTO_PLANTILLA_SELECT,
    });
  }
}
