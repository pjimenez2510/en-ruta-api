import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoViaje, Prisma, RolUsuario } from '@prisma/client';
import { CreateViajeDto, UpdateViajeDto, FiltroViajeDto } from './dto';
import { VIAJE_SELECT_WITH_RELATIONS, VIAJE_SELECT_WITH_RELATIONS_WITH_PARADAS } from './constants/viaje-select';

@Injectable()
export class ViajesService {
  constructor(private prisma: PrismaService) {}

  async obtenerViajes(
    filtro: Prisma.ViajeWhereInput,
    args: Prisma.ViajeSelect = VIAJE_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.viaje.findMany({
      where: filtro,
      orderBy: [{ fecha: 'desc' }, { horaSalidaReal: 'asc' }],
      select: args,
    });
  }

  async obtenerViaje(
    filtro: Prisma.ViajeWhereUniqueInput,
    args: Prisma.ViajeSelect = VIAJE_SELECT_WITH_RELATIONS_WITH_PARADAS,
  ) {
    const viaje = await this.prisma.viaje.findUnique({
      where: filtro,
      select: args,
    });

    if (!viaje) {
      throw new NotFoundException(
        `Viaje con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return viaje;
  }

  async crearViaje(
    datos: CreateViajeDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    // Validar que el horario de ruta pertenezca a la ruta
    const horarioRuta = await this.prisma.horarioRuta.findFirst({
      where: {
        id: datos.horarioRutaId,
        ruta: {
          tenantId,
        },
      },
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            tipoRutaBusId: true,
          },
        },
      },
    });

    if (!horarioRuta) {
      throw new NotFoundException(
        `El horario de ruta con ID ${datos.horarioRutaId} no existe`,
      );
    }

    // Validar que el bus pertenezca al tenant
    const bus = await this.prisma.bus.findUnique({
      where: { id: datos.busId, tenantId },
      select: {
        id: true,
        numero: true,
        placa: true,
        totalAsientos: true,
        tipoRutaBusId: true,
      },
    });

    if (!bus) {
      throw new NotFoundException(
        `El bus con ID ${datos.busId} no existe o no pertenece al tenant ${tenantId}`,
      );
    }

    // Validar que el bus y la ruta sean del mismo tipo
    if (bus.tipoRutaBusId !== horarioRuta.ruta.tipoRutaBusId) {
      const tipoRutaBus = await this.prisma.tipoRutaBus.findMany({
        where: {
          id: { in: [bus.tipoRutaBusId, horarioRuta.ruta.tipoRutaBusId] },
        },
        select: { id: true, nombre: true },
      });
      
      const tipoBus = tipoRutaBus.find(t => t.id === bus.tipoRutaBusId);
      const tipoRuta = tipoRutaBus.find(t => t.id === horarioRuta.ruta.tipoRutaBusId);
      
      throw new BadRequestException(
        `El bus (tipo: ${tipoBus?.nombre}) y la ruta (tipo: ${tipoRuta?.nombre}) deben ser del mismo tipo de ruta de bus`,
      );
    }

    // Validar conductor si se proporciona
    if (datos.conductorId) {
      const conductor = await this.prisma.usuarioTenant.findFirst({
        where: {
          id: datos.conductorId,
          tenantId,
          rol: 'CONDUCTOR',
          activo: true,
        },
      });

      if (!conductor) {
        throw new NotFoundException(
          `El conductor con ID ${datos.conductorId} no existe o no pertenece al tenant ${tenantId}`,
        );
      }
    }

    // Validar ayudante si se proporciona
    if (datos.ayudanteId) {
      const ayudante = await this.prisma.usuarioTenant.findFirst({
        where: {
          id: datos.ayudanteId,
          tenantId,
          rol: 'AYUDANTE',
          activo: true,
        },
      });

      if (!ayudante) {
        throw new NotFoundException(
          `El ayudante con ID ${datos.ayudanteId} no existe o no pertenece al tenant ${tenantId}`,
        );
      }
    }

    // Verificar que no exista un viaje duplicado
    const viajeExistente = await this.prisma.viaje.findFirst({
      where: {
        fecha: new Date(datos.fecha),
        horarioRutaId: datos.horarioRutaId,
        busId: datos.busId,
      },
    });

    if (viajeExistente) {
      throw new ConflictException(
        'Ya existe un viaje programado para esta ruta, fecha, horario y bus',
      );
    }

    return await (tx || this.prisma).viaje.create({
      data: {
        tenantId,
        horarioRutaId: datos.horarioRutaId,
        busId: datos.busId,
        conductorId: datos.conductorId,
        ayudanteId: datos.ayudanteId,
        fecha: new Date(datos.fecha),
        estado: datos.estado ?? 'PROGRAMADO',
        observaciones: datos.observaciones,
        capacidadTotal: bus.totalAsientos,
        asientosOcupados: 0,
        generacion: datos.generacion ?? 'MANUAL',
      },
      select: VIAJE_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarViaje(
    id: number,
    datos: UpdateViajeDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const viaje = await this.obtenerViaje({ id, tenantId });

    if (
      viaje.estado === EstadoViaje.EN_RUTA ||
      viaje.estado === EstadoViaje.COMPLETADO
    ) {
      throw new BadRequestException(
        'No se puede actualizar un viaje en ruta o completado',
      );
    }

    const datosActualizacion: Prisma.ViajeUncheckedUpdateInput = {};

    if (datos.busId) {
      const bus = await this.prisma.bus.findUnique({
        where: { id: datos.busId, tenantId },
        select: {
          id: true,
          numero: true,
          placa: true,
          totalAsientos: true,
          tipoRutaBusId: true,
        },
      });

      if (!bus) {
        throw new NotFoundException(
          `El bus con ID ${datos.busId} no existe o no pertenece al tenant ${tenantId}`,
        );
      }

      // Validar que el bus sea del mismo tipo que la ruta del viaje
      const horarioRuta = await this.prisma.horarioRuta.findUnique({
        where: { id: viaje.horarioRutaId },
        include: {
          ruta: {
            select: {
              tipoRutaBusId: true,
            },
          },
        },
      });

      if (bus.tipoRutaBusId !== horarioRuta.ruta.tipoRutaBusId) {
        const tipoRutaBus = await this.prisma.tipoRutaBus.findMany({
          where: {
            id: { in: [bus.tipoRutaBusId, horarioRuta.ruta.tipoRutaBusId] },
          },
          select: { id: true, nombre: true },
        });
        
        const tipoBus = tipoRutaBus.find(t => t.id === bus.tipoRutaBusId);
        const tipoRuta = tipoRutaBus.find(t => t.id === horarioRuta.ruta.tipoRutaBusId);
        
        throw new BadRequestException(
          `El bus (tipo: ${tipoBus?.nombre}) y la ruta (tipo: ${tipoRuta?.nombre}) deben ser del mismo tipo de ruta de bus`,
        );
      }

      datosActualizacion.capacidadTotal = bus.totalAsientos;
    }

    if (datos.horarioRutaId) {
      const horarioRuta = await this.prisma.horarioRuta.findFirst({
        where: {
          id: datos.horarioRutaId,
          ruta: {
            tenantId,
          },
        },
        include: {
          ruta: {
            select: {
              tipoRutaBusId: true,
            },
          },
        },
      });

      if (!horarioRuta) {
        throw new NotFoundException(
          `El horario de ruta con ID ${datos.horarioRutaId} no existe`,
        );
      }

      // Validar que la nueva ruta sea del mismo tipo que el bus del viaje
      const bus = await this.prisma.bus.findUnique({
        where: { id: viaje.busId },
        select: {
          tipoRutaBusId: true,
        },
      });

      if (bus.tipoRutaBusId !== horarioRuta.ruta.tipoRutaBusId) {
        const tipoRutaBus = await this.prisma.tipoRutaBus.findMany({
          where: {
            id: { in: [bus.tipoRutaBusId, horarioRuta.ruta.tipoRutaBusId] },
          },
          select: { id: true, nombre: true },
        });
        
        const tipoBus = tipoRutaBus.find(t => t.id === bus.tipoRutaBusId);
        const tipoRuta = tipoRutaBus.find(t => t.id === horarioRuta.ruta.tipoRutaBusId);
        
        throw new BadRequestException(
          `El bus (tipo: ${tipoBus?.nombre}) y la ruta (tipo: ${tipoRuta?.nombre}) deben ser del mismo tipo de ruta de bus`,
        );
      }
    }

    if (datos.conductorId) {
      const conductor = await this.prisma.usuarioTenant.findFirst({
        where: {
          id: datos.conductorId,
          tenantId,
          rol: RolUsuario.CONDUCTOR,
          activo: true,
        },
      });

      if (!conductor) {
        throw new NotFoundException(
          `El conductor con ID ${datos.conductorId} no existe o no pertenece al tenant ${tenantId}`,
        );
      }
    }

    if (datos.ayudanteId) {
      const ayudante = await this.prisma.usuarioTenant.findFirst({
        where: {
          id: datos.ayudanteId,
          tenantId,
          rol: RolUsuario.AYUDANTE,
          activo: true,
        },
      });

      if (!ayudante) {
        throw new NotFoundException(
          `El ayudante con ID ${datos.ayudanteId} no existe o no pertenece al tenant ${tenantId}`,
        );
      }
    }

    if (datos.horarioRutaId !== undefined)
      datosActualizacion.horarioRutaId = datos.horarioRutaId;
    if (datos.busId !== undefined) datosActualizacion.busId = datos.busId;
    if (datos.conductorId !== undefined)
      datosActualizacion.conductorId = datos.conductorId;
    if (datos.ayudanteId !== undefined)
      datosActualizacion.ayudanteId = datos.ayudanteId;
    if (datos.fecha !== undefined)
      datosActualizacion.fecha = new Date(datos.fecha);
    if (datos.estado !== undefined) datosActualizacion.estado = datos.estado;
    if (datos.observaciones !== undefined)
      datosActualizacion.observaciones = datos.observaciones;
    if (datos.generacion !== undefined)
      datosActualizacion.generacion = datos.generacion;

    return await (tx || this.prisma).viaje.update({
      where: { id },
      data: datosActualizacion,
      select: VIAJE_SELECT_WITH_RELATIONS,
    });
  }

  async cambiarEstadoViaje(
    id: number,
    nuevoEstado: EstadoViaje,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const viaje = await this.obtenerViaje({ id, tenantId });

    if (viaje.estado === EstadoViaje.COMPLETADO) {
      throw new BadRequestException(
        'No se puede cambiar el estado de un viaje completado',
      );
    }

    if (
      nuevoEstado === EstadoViaje.PROGRAMADO &&
      viaje.estado === EstadoViaje.EN_RUTA
    ) {
      throw new BadRequestException(
        'No se puede programar un viaje que ya está en ruta',
      );
    }

    if (
      nuevoEstado === EstadoViaje.COMPLETADO &&
      viaje.estado !== EstadoViaje.EN_RUTA
    ) {
      throw new BadRequestException(
        'No se puede completar un viaje que no está en ruta',
      );
    }

    if (
      nuevoEstado === EstadoViaje.CANCELADO &&
      viaje.estado === EstadoViaje.EN_RUTA
    ) {
      throw new BadRequestException(
        'No se puede cancelar un viaje que está en ruta',
      );
    }

    if (
      nuevoEstado === EstadoViaje.RETRASADO &&
      viaje.estado === EstadoViaje.EN_RUTA
    ) {
      throw new BadRequestException(
        'No se puede retrasar un viaje que está en ruta',
      );
    }

    let horaSalidaReal: Date | null = null;
    if (nuevoEstado === EstadoViaje.EN_RUTA) {
      horaSalidaReal = new Date();
    }

    return await (tx || this.prisma).viaje.update({
      where: { id },
      data: { estado: nuevoEstado, horaSalidaReal },
      select: VIAJE_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarViaje(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const viaje = await this.obtenerViaje({ id, tenantId });

    if (
      viaje.estado === EstadoViaje.EN_RUTA ||
      viaje.estado === EstadoViaje.COMPLETADO
    ) {
      throw new BadRequestException(
        'No se puede eliminar un viaje en ruta o completado',
      );
    }

    // Verificar si hay boletos asociados
    const boletosAsociados = await this.prisma.boleto.count({
      where: { viajeId: id },
    });

    if (boletosAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar el viaje porque tiene ${boletosAsociados} boleto(s) asociado(s)`,
      );
    }

    // Verificar si hay ventas asociadas
    const ventasAsociadas = await this.prisma.venta.count({
      where: { viajeId: id },
    });

    if (ventasAsociadas > 0) {
      throw new ConflictException(
        `No se puede eliminar el viaje porque tiene ${ventasAsociadas} venta(s) asociada(s)`,
      );
    }

    return await (tx || this.prisma).viaje.delete({
      where: { id },
      select: VIAJE_SELECT_WITH_RELATIONS,
    });
  }

  async obtenerViajesDisponibles(
    horarioRutaId: number,
    fecha: string,
    tenantId?: number,
  ) {
    const filtro: Prisma.ViajeWhereInput = {
      horarioRutaId,
      fecha: new Date(fecha),
      estado: {
        in: [EstadoViaje.PROGRAMADO, EstadoViaje.RETRASADO],
      },
    };

    if (tenantId) {
      filtro.tenantId = tenantId;
    }

    return await this.prisma.viaje.findMany({
      where: filtro,
      orderBy: [{ horaSalidaReal: 'asc' }],
      select: {
        ...VIAJE_SELECT_WITH_RELATIONS,
        _count: {
          select: {
            boletos: true,
          },
        },
      },
    });
  }
}
