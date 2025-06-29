import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EstadoAsiento } from '@prisma/client';
import {
  CreateAsientoDto,
  UpdateAsientoDto,
  CreateAsientosMasivoDto,
  CreateAsientoItemDto,
} from './dto';
import { ASIENTO_SELECT } from './constants/asiento-select';

@Injectable()
export class AsientosService {
  constructor(private prisma: PrismaService) {}

  async obtenerAsientos({
    filtro,
    args = ASIENTO_SELECT,
    tx,
  }: {
    filtro: Prisma.AsientoWhereInput;
    args?: Prisma.AsientoSelect;
    tx?: Prisma.TransactionClient;
  }) {
    return await (tx || this.prisma).asiento.findMany({
      where: filtro,
      orderBy: [{ pisoBusId: 'asc' }, { fila: 'asc' }, { columna: 'asc' }],
      select: args,
    });
  }

  async obtenerAsiento({
    filtro,
    args = ASIENTO_SELECT,
    tx,
  }: {
    filtro: Prisma.AsientoWhereUniqueInput;
    args?: Prisma.AsientoSelect;
    tx?: Prisma.TransactionClient;
  }) {
    const asiento = await (tx || this.prisma).asiento.findUnique({
      where: filtro,
      select: args,
    });

    if (!asiento) {
      throw new NotFoundException(
        `Asiento con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return asiento;
  }

  async crearAsiento(datos: CreateAsientoDto, tx?: Prisma.TransactionClient) {
    const pisoBus = await (tx || this.prisma).pisoBus.findUnique({
      where: { id: datos.pisoBusId },
      include: { bus: true },
    });

    if (!pisoBus) {
      throw new NotFoundException(
        `No se encontró el piso de bus con ID ${datos.pisoBusId}`,
      );
    }

    const tipoAsiento = await (tx || this.prisma).tipoAsiento.findFirst({
      where: {
        id: datos.tipoId,
        tenantId: pisoBus.bus.tenantId,
      },
    });

    if (!tipoAsiento) {
      throw new NotFoundException(
        `No se encontró el tipo de asiento con ID ${datos.tipoId} para el tenant ${pisoBus.bus.tenantId}`,
      );
    }

    const existente = await (tx || this.prisma).asiento.findUnique({
      where: {
        pisoBusId_numero: {
          pisoBusId: datos.pisoBusId,
          numero: datos.numero,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un asiento con el número ${datos.numero} en el piso de bus con ID ${datos.pisoBusId}`,
      );
    }

    return await (tx || this.prisma).asiento.create({
      data: {
        ...datos,
        estado: datos.estado || EstadoAsiento.DISPONIBLE,
      },
      select: ASIENTO_SELECT,
    });
  }

  async actualizarAsiento(
    id: number,
    datos: UpdateAsientoDto,
    tx?: Prisma.TransactionClient,
  ) {
    const asientoActual = await (tx || this.prisma).asiento.findUnique({
      where: { id },
      include: {
        pisoBus: {
          include: {
            bus: true,
          },
        },
      },
    });

    if (!asientoActual) {
      throw new NotFoundException(`No se encontró el asiento con ID ${id}`);
    }

    if (
      datos.pisoBusId !== undefined &&
      datos.pisoBusId !== asientoActual.pisoBusId
    ) {
      const pisoBus = await (tx || this.prisma).pisoBus.findUnique({
        where: { id: datos.pisoBusId },
        include: { bus: true },
      });

      if (!pisoBus) {
        throw new NotFoundException(
          `No se encontró el piso de bus con ID ${datos.pisoBusId}`,
        );
      }

      const tenantIdActual = asientoActual.pisoBus.bus.tenantId;
      if (pisoBus.bus.tenantId !== tenantIdActual) {
        throw new ConflictException(
          `No se puede cambiar el asiento a un bus de otro tenant`,
        );
      }
    }

    if (datos.tipoId !== undefined && datos.tipoId !== asientoActual.tipoId) {
      const tenantId = asientoActual.pisoBus.bus.tenantId;
      const tipoAsiento = await (tx || this.prisma).tipoAsiento.findFirst({
        where: {
          id: datos.tipoId,
          tenantId,
        },
      });

      if (!tipoAsiento) {
        throw new NotFoundException(
          `No se encontró el tipo de asiento con ID ${datos.tipoId} para el tenant ${tenantId}`,
        );
      }
    }

    if (
      (datos.numero !== undefined && datos.numero !== asientoActual.numero) ||
      (datos.pisoBusId !== undefined &&
        datos.pisoBusId !== asientoActual.pisoBusId)
    ) {
      const pisoBusId =
        datos.pisoBusId !== undefined
          ? datos.pisoBusId
          : asientoActual.pisoBusId;
      const numero =
        datos.numero !== undefined ? datos.numero : asientoActual.numero;

      const existente = await (tx || this.prisma).asiento.findUnique({
        where: {
          pisoBusId_numero: {
            pisoBusId,
            numero,
          },
        },
      });

      if (existente && existente.id !== id) {
        throw new ConflictException(
          `Ya existe un asiento con el número ${numero} en el piso de bus con ID ${pisoBusId}`,
        );
      }
    }

    if (
      (datos.fila !== undefined && datos.fila !== asientoActual.fila) ||
      (datos.columna !== undefined &&
        datos.columna !== asientoActual.columna) ||
      (datos.pisoBusId !== undefined &&
        datos.pisoBusId !== asientoActual.pisoBusId)
    ) {
      const pisoBusId =
        datos.pisoBusId !== undefined
          ? datos.pisoBusId
          : asientoActual.pisoBusId;
      const fila = datos.fila !== undefined ? datos.fila : asientoActual.fila;
      const columna =
        datos.columna !== undefined ? datos.columna : asientoActual.columna;

      const existente = await (tx || this.prisma).asiento.findFirst({
        where: {
          pisoBusId,
          fila,
          columna,
          NOT: {
            id,
          },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un asiento en la posición (${fila}, ${columna}) en el piso de bus con ID ${pisoBusId}`,
        );
      }
    }

    return await (tx || this.prisma).asiento.update({
      where: { id },
      data: datos,
      select: ASIENTO_SELECT,
    });
  }

  async eliminarAsiento(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerAsiento({ filtro: { id }, tx });

    const boletosAsociados = await (tx || this.prisma).boleto.count({
      where: { asientoId: id },
    });

    if (boletosAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar el asiento porque tiene ${boletosAsociados} boletos asociados`,
      );
    }

    return await (tx || this.prisma).asiento.delete({
      where: { id },
      select: ASIENTO_SELECT,
    });
  }

  async cambiarEstadoAsiento(
    id: number,
    estado: EstadoAsiento,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerAsiento({ filtro: { id }, tx });

    return await (tx || this.prisma).asiento.update({
      where: { id },
      data: { estado },
      select: ASIENTO_SELECT,
    });
  }

  async crearAsientosMasivo(
    datos: CreateAsientosMasivoDto,
    tx?: Prisma.TransactionClient,
  ) {
    const { pisoBusId, asientos } = datos;

    const pisoBus = await (tx || this.prisma).pisoBus.findUnique({
      where: { id: pisoBusId },
      include: { bus: true },
    });

    if (!pisoBus) {
      throw new NotFoundException(
        `No se encontró el piso de bus con ID ${pisoBusId}`,
      );
    }

    const tenantId = pisoBus.bus.tenantId;

    const numerosAsiento = asientos.map((a) => a.numero);
    if (new Set(numerosAsiento).size !== numerosAsiento.length) {
      throw new BadRequestException(
        'Hay números de asiento duplicados en la solicitud',
      );
    }

    const asientosExistentes = await (tx || this.prisma).asiento.findMany({
      where: {
        pisoBusId,
        numero: { in: numerosAsiento },
      },
      select: { numero: true },
    });

    if (asientosExistentes.length > 0) {
      const numerosExistentes = asientosExistentes
        .map((a) => a.numero)
        .join(', ');
      throw new ConflictException(
        `Ya existen asientos con los siguientes números en este piso: ${numerosExistentes}`,
      );
    }

    const posiciones = asientos.map((a) => `${a.fila}-${a.columna}`);
    if (new Set(posiciones).size !== posiciones.length) {
      throw new BadRequestException(
        'Hay posiciones (fila, columna) duplicadas en la solicitud',
      );
    }

    const posicionesExistentes = await (tx || this.prisma).asiento.findMany({
      where: {
        pisoBusId,
        OR: asientos.map((a) => ({
          fila: a.fila,
          columna: a.columna,
        })),
      },
      select: { fila: true, columna: true },
    });

    if (posicionesExistentes.length > 0) {
      const posicionesExistentesStr = posicionesExistentes
        .map((a) => `(${a.fila}, ${a.columna})`)
        .join(', ');
      throw new ConflictException(
        `Ya existen asientos en las siguientes posiciones en este piso: ${posicionesExistentesStr}`,
      );
    }

    const tiposIds = [...new Set(asientos.map((a) => a.tipoId))];
    const tiposAsiento = await (tx || this.prisma).tipoAsiento.findMany({
      where: {
        id: { in: tiposIds },
        tenantId,
      },
    });

    if (tiposAsiento.length !== tiposIds.length) {
      const tiposEncontrados = tiposAsiento.map((t) => t.id);
      const tiposFaltantes = tiposIds.filter(
        (id) => !tiposEncontrados.includes(id),
      );
      throw new NotFoundException(
        `No se encontraron los siguientes tipos de asiento: ${tiposFaltantes.join(', ')}`,
      );
    }

    if (tx) {
      return await this.procesarCreacionAsientos(tx, pisoBusId, asientos);
    }

    return await this.prisma.$transaction(
      async (txClient) => {
        return await this.procesarCreacionAsientos(
          txClient,
          pisoBusId,
          asientos,
        );
      },
      {
        timeout: 30000,
      },
    );
  }

  private async procesarCreacionAsientos(
    txClient: Prisma.TransactionClient,
    pisoBusId: number,
    asientos: CreateAsientoItemDto[],
  ) {
    const asientosCreados = [];

    for (const asiento of asientos) {
      const asientoData = {
        ...asiento,
        pisoBusId,
        estado: asiento.estado || EstadoAsiento.DISPONIBLE,
      };

      const creado = await txClient.asiento.create({
        data: asientoData,
        select: ASIENTO_SELECT,
      });

      asientosCreados.push(creado);
    }

    return asientosCreados;
  }
}
