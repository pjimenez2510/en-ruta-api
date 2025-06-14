import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateParadaRutaDto, UpdateParadaRutaDto } from './dto';
import { PARADA_RUTA_SELECT_WITH_RELATIONS } from './constants/parada-ruta-select';

@Injectable()
export class ParadasRutaService {
  constructor(private prisma: PrismaService) {}

  async obtenerParadasRuta(
    filtro: Prisma.ParadaRutaWhereInput,
    args: Prisma.ParadaRutaSelect = PARADA_RUTA_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.paradaRuta.findMany({
      where: filtro,
      orderBy: [{ rutaId: 'asc' }, { orden: 'asc' }],
      select: args,
    });
  }

  async obtenerParadaRuta(
    filtro: Prisma.ParadaRutaWhereUniqueInput,
    args: Prisma.ParadaRutaSelect = PARADA_RUTA_SELECT_WITH_RELATIONS,
  ) {
    const paradaRuta = await this.prisma.paradaRuta.findUnique({
      where: filtro,
      select: args,
    });

    if (!paradaRuta) {
      throw new NotFoundException(
        `Parada de ruta con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return paradaRuta;
  }

  async crearParadaRuta(
    datos: CreateParadaRutaDto,
    tenantId?: number,
    tx?: Prisma.TransactionClient,
  ) {
    // Verificar que la ruta existe y pertenece al tenant si se especifica
    const ruta = await this.prisma.ruta.findUnique({
      where: { id: datos.rutaId },
      select: { id: true, tenantId: true },
    });

    if (!ruta) {
      throw new NotFoundException('La ruta especificada no existe');
    }

    if (tenantId && ruta.tenantId !== tenantId) {
      throw new ForbiddenException('No tienes permisos para modificar esta ruta');
    }

    // Verificar que la ciudad existe
    const ciudad = await this.prisma.ciudad.findUnique({
      where: { id: datos.ciudadId },
      select: { id: true },
    });

    if (!ciudad) {
      throw new NotFoundException('La ciudad especificada no existe');
    }

    // Verificar que no existe una parada con el mismo orden en la ruta
    const paradaExistentePorOrden = await this.prisma.paradaRuta.findUnique({
      where: {
        rutaId_orden: {
          rutaId: datos.rutaId,
          orden: datos.orden,
        },
      },
    });

    if (paradaExistentePorOrden) {
      throw new ConflictException(
        `Ya existe una parada en el orden ${datos.orden} para esta ruta`,
      );
    }

    // Verificar que no existe una parada con la misma ciudad en la ruta
    const paradaExistentePorCiudad = await this.prisma.paradaRuta.findUnique({
      where: {
        rutaId_ciudadId: {
          rutaId: datos.rutaId,
          ciudadId: datos.ciudadId,
        },
      },
    });

    if (paradaExistentePorCiudad) {
      throw new ConflictException(
        `Ya existe una parada en esta ciudad para esta ruta`,
      );
    }

    return await (tx || this.prisma).paradaRuta.create({
      data: {
        rutaId: datos.rutaId,
        ciudadId: datos.ciudadId,
        orden: datos.orden,
        distanciaAcumulada: datos.distanciaAcumulada,
        tiempoAcumulado: datos.tiempoAcumulado,
        precioAcumulado: datos.precioAcumulado,
      },
      select: PARADA_RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarParadaRuta(
    id: number,
    datos: UpdateParadaRutaDto,
    tenantId?: number,
    tx?: Prisma.TransactionClient,
  ) {
    const paradaRutaExistente = await this.obtenerParadaRuta({ id, ruta: { tenantId } });

    if (datos.ciudadId && datos.ciudadId !== paradaRutaExistente.ciudadId) {
      const ciudad = await this.prisma.ciudad.findUnique({
        where: { id: datos.ciudadId },
        select: { id: true },
      });

      if (!ciudad) {
        throw new NotFoundException('La ciudad especificada no existe');
      }

      // Verificar que no existe otra parada con la misma ciudad en la ruta
      const paradaExistentePorCiudad = await this.prisma.paradaRuta.findFirst({
        where: {
          rutaId: paradaRutaExistente.rutaId,
          ciudadId: datos.ciudadId,
          NOT: { id },
        },
      });

      if (paradaExistentePorCiudad) {
        throw new ConflictException(
          `Ya existe una parada en esta ciudad para esta ruta`,
        );
      }
    }

    // Verificar orden si se está cambiando
    if (datos.orden !== undefined && datos.orden !== paradaRutaExistente.orden) {
      const paradaExistentePorOrden = await this.prisma.paradaRuta.findFirst({
        where: {
          rutaId: paradaRutaExistente.rutaId,
          orden: datos.orden,
          NOT: { id },
        },
      });

      if (paradaExistentePorOrden) {
        throw new ConflictException(
          `Ya existe una parada en el orden ${datos.orden} para esta ruta`,
        );
      }
    }

    return await (tx || this.prisma).paradaRuta.update({
      where: { id },
      data: datos,
      select: PARADA_RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarParadaRuta(
    id: number,
    tenantId?: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerParadaRuta({ id, ruta: { tenantId } });

    return await (tx || this.prisma).paradaRuta.delete({
      where: { id },
      select: PARADA_RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async obtenerParadasPorRuta(rutaId: number, tenantId?: number) {
    const filtro: Prisma.ParadaRutaWhereInput = { rutaId };
    
    if (tenantId) {
      filtro.ruta = { tenantId };
    }

    return await this.obtenerParadasRuta(filtro);
  }
} 