import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBusDto, UpdateBusDto } from './dto';
import { BUS_SELECT_WITH_RELATIONS, BUS_SELECT_WITH_PISOS_AND_ASIENTOS } from './constants/bus-select';
import { PISO_BUS_SELECT } from '../pisos-bus/constants/piso-bus-select';

@Injectable()
export class BusesService {
  constructor(private prisma: PrismaService) {}

  async obtenerBuses(
    filtro: Prisma.BusWhereInput,
    args: Prisma.BusSelect = BUS_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.bus.findMany({
      where: filtro,
      orderBy: { numero: 'asc' },
      select: args,
    });
  }

  async obtenerBus(
    filtro: Prisma.BusWhereUniqueInput,
    args: Prisma.BusSelect = BUS_SELECT_WITH_RELATIONS,
  ) {
    const bus = await this.prisma.bus.findUnique({
      where: filtro,
      select: args,
    });

    if (!bus) {
      throw new NotFoundException(
        `Bus con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return bus;
  }

  async obtenerBusConDisponibilidad(
    busId: number,
    viajeId: number,
    ciudadOrigenId: number,
    ciudadDestinoId: number,
  ) {
    // 1. Obtener el bus con toda su información
    const bus = await this.prisma.bus.findUnique({
      where: { id: busId },
      select: BUS_SELECT_WITH_PISOS_AND_ASIENTOS,
    });

    if (!bus) {
      throw new NotFoundException(`Bus con ID ${busId} no encontrado`);
    }

    // 2. Obtener el viaje y validar que corresponda al bus
    const viaje = await this.prisma.viaje.findUnique({
      where: { id: viajeId },
      select: {
        id: true,
        busId: true,
        horarioRuta: {
          select: {
            ruta: {
              select: {
                paradas: {
                  select: {
                    id: true,
                    orden: true,
                    precioAcumulado: true,
                    ciudadId: true,
                    ciudad: {
                      select: {
                        id: true,
                        nombre: true,
                      },
                    },
                  },
                  orderBy: { orden: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!viaje) {
      throw new NotFoundException(`Viaje con ID ${viajeId} no encontrado`);
    }

    if (viaje.busId !== busId) {
      throw new NotFoundException(`El viaje ${viajeId} no corresponde al bus ${busId}`);
    }

    const paradas = viaje.horarioRuta.ruta.paradas;
    const paradaOrigen = paradas.find(p => p.ciudadId === ciudadOrigenId);
    const paradaDestino = paradas.find(p => p.ciudadId === ciudadDestinoId);

    if (!paradaOrigen) {
      throw new NotFoundException(`Ciudad de origen ${ciudadOrigenId} no encontrada en la ruta`);
    }

    if (!paradaDestino) {
      throw new NotFoundException(`Ciudad de destino ${ciudadDestinoId} no encontrada en la ruta`);
    }

    if (paradaOrigen.orden >= paradaDestino.orden) {
      throw new NotFoundException('La ciudad de origen debe estar antes que la ciudad de destino en la ruta');
    }

    const ocupaciones = await this.prisma.ocupacionAsiento.findMany({
      where: {
        viajeId: viajeId,
        AND: [
          {
            paradaOrigen: {
              orden: {
                lt: paradaDestino.orden, 
              },
            },
          },
          {
            paradaDestino: {
              orden: {
                gt: paradaOrigen.orden,
              },
            },
          },
        ],
      },
      select: {
        asientoId: true,
        paradaOrigen: {
          select: {
            orden: true,
            ciudad: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        paradaDestino: {
          select: {
            orden: true,
            ciudad: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        boleto: {
          select: {
            id: true,
            codigoAcceso: true,
            cliente: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
      },
    });

    const asientosOcupados = new Map();
    ocupaciones.forEach(ocupacion => {
      asientosOcupados.set(ocupacion.asientoId, {
        paradaOrigen: ocupacion.paradaOrigen,
        paradaDestino: ocupacion.paradaDestino,
        boleto: ocupacion.boleto,
      });
    });

    
    const precio = paradaDestino.precioAcumulado.toNumber() - paradaOrigen.precioAcumulado.toNumber();

    const busConDisponibilidad = {
      ...bus,
      pisos: bus.pisos.map((piso: any) => ({
        ...piso,
        asientos: piso?.asientos?.map((asiento: any) => {
          const ocupacion = asientosOcupados.get(asiento.id);
          return {
            ...asiento,
            disponible: !ocupacion && asiento.estado === 'DISPONIBLE',
            precio: (precio * asiento.tipo.factorPrecio.toNumber()).toFixed(2),
          };
        }),
      })),
    };

    return busConDisponibilidad;
  }

  async crearBus(
    tenantId: number,
    datos: CreateBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    console.log('tenantId', tenantId);
    console.log('datos', datos);
    
    // Validar que el tipo de ruta de bus pertenezca al tenant
    const tipoRutaBus = await this.prisma.tipoRutaBus.findFirst({
      where: {
        id: datos.tipoRutaBusId,
        tenantId,
      },
    });

    if (!tipoRutaBus) {
      throw new NotFoundException(
        `El tipo de ruta de bus con ID ${datos.tipoRutaBusId} no existe o no pertenece al tenant ${tenantId}`,
      );
    }

    const existenteNumero = await this.prisma.bus.findUnique({
      where: {
        tenantId_numero: {
          tenantId,
          numero: datos.numero,
        },
      },
    });

    if (existenteNumero) {
      throw new ConflictException(
        `Ya existe un bus con el número ${datos.numero} en este tenant`,
      );
    }

    const existentePlaca = await this.prisma.bus.findUnique({
      where: {
        tenantId_placa: {
          tenantId,
          placa: datos.placa,
        },
      },
    });

    if (existentePlaca) {
      throw new ConflictException(
        `Ya existe un bus con la placa ${datos.placa} en este tenant`,
      );
    }

    return await (tx || this.prisma).bus.create({
      data: {
        ...datos,
        tenantId,
      },
      select: BUS_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarBus(
    id: number,
    tenantId: number,
    datos: UpdateBusDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerBus({ id });

    // Validar que el tipo de ruta de bus pertenezca al tenant si se está actualizando
    if (datos.tipoRutaBusId) {
      const tipoRutaBus = await this.prisma.tipoRutaBus.findFirst({
        where: {
          id: datos.tipoRutaBusId,
          tenantId,
        },
      });

      if (!tipoRutaBus) {
        throw new NotFoundException(
          `El tipo de ruta de bus con ID ${datos.tipoRutaBusId} no existe o no pertenece al tenant ${tenantId}`,
        );
      }
    }

    if (datos.numero) {
      const existenteNumero = await this.prisma.bus.findFirst({
        where: {
          tenantId,
          numero: datos.numero,
          NOT: {
            id,
          },
        },
      });

      if (existenteNumero) {
        throw new ConflictException(
          `Ya existe un bus con el número ${datos.numero} en este tenant`,
        );
      }
    }

    if (datos.placa) {
      const existentePlaca = await this.prisma.bus.findFirst({
        where: {
          tenantId,
          placa: datos.placa,
          NOT: {
            id,
          },
        },
      });

      if (existentePlaca) {
        throw new ConflictException(
          `Ya existe un bus con la placa ${datos.placa} en este tenant`,
        );
      }
    }

    return await (tx || this.prisma).bus.update({
      where: { id },
      data: datos,
      select: BUS_SELECT_WITH_RELATIONS,
    });
  }

  async cambiarEstadoBus(
    id: number,
    estado: Prisma.EnumEstadoBusFieldUpdateOperationsInput,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerBus({ id });

    return await (tx || this.prisma).bus.update({
      where: { id },
      data: { estado },
      select: BUS_SELECT_WITH_RELATIONS,
    });
  }
}
