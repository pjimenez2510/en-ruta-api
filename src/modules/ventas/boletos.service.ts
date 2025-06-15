import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EstadoBoleto } from '@prisma/client';
import { FiltroBoletoDto, UpdateBoletoDto } from './dto';
import { BOLETO_SELECT_WITH_RELATIONS } from './constants/boleto-select';
import { EmailService } from '../email/email.service';

@Injectable()
export class BoletosService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async obtenerBoletos(
    filtro: Prisma.BoletoWhereInput,
    args: Prisma.BoletoSelect = BOLETO_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.boleto.findMany({
      where: filtro,
      orderBy: [{ fechaViaje: 'desc' }, { horaSalida: 'asc' }],
      select: args,
    });
  }

  async obtenerBoleto(
    filtro: Prisma.BoletoWhereUniqueInput,
    args: Prisma.BoletoSelect = BOLETO_SELECT_WITH_RELATIONS,
  ) {
    const boleto = await this.prisma.boleto.findUnique({
      where: filtro,
      select: args,
    });

    if (!boleto) {
      throw new NotFoundException(
        `Boleto con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return boleto;
  }

  async obtenerBoletoPorCodigo(
    codigoAcceso: string,
    args: Prisma.BoletoSelect = BOLETO_SELECT_WITH_RELATIONS,
  ) {
    return await this.obtenerBoleto({ codigoAcceso }, args);
  }

  async actualizarEstadoBoleto(
    id: number,
    datos: UpdateBoletoDto,
    tenantId: number,
  ) {
    const boleto = await this.obtenerBoleto({ id, tenantId });

    if (boleto.estado === EstadoBoleto.ABORDADO) {
      throw new BadRequestException(
        'No se puede cambiar el estado de un boleto ya abordado',
      );
    }

    if (boleto.estado === EstadoBoleto.CANCELADO) {
      throw new BadRequestException(
        'No se puede cambiar el estado de un boleto cancelado',
      );
    }

    const boletoActualizado = await this.prisma.boleto.update({
      where: { id },
      data: datos,
      select: BOLETO_SELECT_WITH_RELATIONS,
    });

    // Enviar notificación de cambio de estado por email
    if (datos.estado) {
      setImmediate(async () => {
        try {
          await this.emailService.enviarCambioEstadoBoleto(id, datos.estado);
        } catch (error) {
          console.error('Error enviando notificación de cambio de estado:', error);
        }
      });
    }

    return boletoActualizado;
  }

  async confirmarBoleto(id: number, tenantId: number) {
    return await this.actualizarEstadoBoleto(
      id,
      { estado: EstadoBoleto.CONFIRMADO },
      tenantId,
    );
  }

  async marcarComoAbordado(id: number, tenantId: number) {
    const boleto = await this.obtenerBoleto({ id, tenantId });

    if (boleto.estado !== EstadoBoleto.CONFIRMADO) {
      throw new BadRequestException(
        'Solo se pueden marcar como abordados los boletos confirmados',
      );
    }

    return await this.actualizarEstadoBoleto(
      id,
      { estado: EstadoBoleto.ABORDADO },
      tenantId,
    );
  }

  async marcarComoNoShow(id: number, tenantId: number) {
    const boleto = await this.obtenerBoleto({ id, tenantId });

    if (boleto.estado !== EstadoBoleto.CONFIRMADO) {
      throw new BadRequestException(
        'Solo se pueden marcar como no show los boletos confirmados',
      );
    }

    return await this.actualizarEstadoBoleto(
      id,
      { estado: EstadoBoleto.NO_SHOW },
      tenantId,
    );
  }

  async obtenerBoletosPorVenta(ventaId: number, tenantId: number) {
    return await this.obtenerBoletos({
      ventaId,
      tenantId,
    });
  }

  async obtenerBoletosPorCliente(
    clienteId: number,
    tenantId: number,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const filtro: Prisma.BoletoWhereInput = {
      clienteId,
      tenantId,
    };

    if (fechaDesde || fechaHasta) {
      filtro.fechaViaje = {};
      if (fechaDesde) filtro.fechaViaje.gte = fechaDesde;
      if (fechaHasta) filtro.fechaViaje.lte = fechaHasta;
    }

    return await this.obtenerBoletos(filtro);
  }

  async obtenerBoletosPorViaje(viajeId: number, tenantId: number) {
    return await this.obtenerBoletos({
      viajeId,
      tenantId,
    });
  }

  async validarBoletoParaAbordaje(codigoAcceso: string, viajeId: number) {
    const boleto = await this.prisma.boleto.findFirst({
      where: {
        codigoAcceso,
        viajeId,
        estado: EstadoBoleto.CONFIRMADO,
      },
      select: BOLETO_SELECT_WITH_RELATIONS,
    });

    if (!boleto) {
      throw new NotFoundException(
        'Boleto no encontrado o no válido para abordaje',
      );
    }

    // Verificar que la fecha del viaje sea hoy o futura
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (boleto.fechaViaje < hoy) {
      throw new BadRequestException(
        'El boleto corresponde a un viaje que ya pasó',
      );
    }

    return boleto;
  }

  async obtenerEstadisticasBoletos(
    tenantId: number,
    fechaDesde?: Date,
    fechaHasta?: Date,
  ) {
    const where: Prisma.BoletoWhereInput = { tenantId };

    if (fechaDesde || fechaHasta) {
      where.fechaViaje = {};
      if (fechaDesde) where.fechaViaje.gte = fechaDesde;
      if (fechaHasta) where.fechaViaje.lte = fechaHasta;
    }

    const [
      totalBoletos,
      boletosPendientes,
      boletosConfirmados,
      boletosAbordados,
      boletosNoShow,
      boletosCancelados,
    ] = await Promise.all([
      this.prisma.boleto.count({ where }),
      this.prisma.boleto.count({ 
        where: { ...where, estado: EstadoBoleto.PENDIENTE } 
      }),
      this.prisma.boleto.count({ 
        where: { ...where, estado: EstadoBoleto.CONFIRMADO } 
      }),
      this.prisma.boleto.count({ 
        where: { ...where, estado: EstadoBoleto.ABORDADO } 
      }),
      this.prisma.boleto.count({ 
        where: { ...where, estado: EstadoBoleto.NO_SHOW } 
      }),
      this.prisma.boleto.count({ 
        where: { ...where, estado: EstadoBoleto.CANCELADO } 
      }),
    ]);

    const tasaAbordaje = boletosConfirmados > 0 
      ? (boletosAbordados / (boletosAbordados + boletosNoShow)) * 100 
      : 0;

    return {
      totalBoletos,
      boletosPendientes,
      boletosConfirmados,
      boletosAbordados,
      boletosNoShow,
      boletosCancelados,
      tasaAbordaje: Math.round(tasaAbordaje * 100) / 100,
    };
  }

  async buscarBoletos(
    termino: string,
    tenantId: number,
    limite: number = 10,
  ) {
    // Buscar por código de acceso, documento o nombre del cliente
    return await this.prisma.boleto.findMany({
      where: {
        tenantId,
        OR: [
          {
            codigoAcceso: {
              contains: termino,
              mode: 'insensitive',
            },
          },
          {
            cliente: {
              numeroDocumento: {
                contains: termino,
                mode: 'insensitive',
              },
            },
          },
          {
            cliente: {
              nombres: {
                contains: termino,
                mode: 'insensitive',
              },
            },
          },
          {
            cliente: {
              apellidos: {
                contains: termino,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      take: limite,
      orderBy: { fechaViaje: 'desc' },
      select: BOLETO_SELECT_WITH_RELATIONS,
    });
  }
} 