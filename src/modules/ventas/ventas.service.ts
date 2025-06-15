import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, EstadoPago, EstadoBoleto, TipoDescuentoCliente } from '@prisma/client';
import { CreateVentaDto, UpdateVentaDto, FiltroVentaDto } from './dto';
import { VENTA_SELECT_WITH_RELATIONS, VENTA_SELECT_WITH_FULL_RELATIONS } from './constants/venta-select';
import { DescuentoCalculatorService } from './services/descuento-calculator.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VentasService {
  constructor(
    private prisma: PrismaService,
    private descuentoCalculatorService: DescuentoCalculatorService,
    private emailService: EmailService,
  ) {}

  async obtenerVentas(
    filtro: Prisma.VentaWhereInput,
    args: Prisma.VentaSelect = VENTA_SELECT_WITH_RELATIONS,
  ) {
    return await this.prisma.venta.findMany({
      where: filtro,
      orderBy: [{ fechaVenta: 'desc' }, { id: 'desc' }],
      select: args,
    });
  }

  async obtenerVenta(
    filtro: Prisma.VentaWhereUniqueInput,
    args: Prisma.VentaSelect = VENTA_SELECT_WITH_FULL_RELATIONS,
  ) {
    const venta = await this.prisma.venta.findUnique({
      where: filtro,
      select: args,
    });

    if (!venta) {
      throw new NotFoundException(
        `Venta con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return venta;
  }

  async crearVenta(datos: CreateVentaDto, usuarioId: number, tenantId: number) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validar que el viaje existe y pertenece al tenant
      const viaje = await tx.viaje.findUnique({
        where: { id: datos.viajeId, tenantId },
        include: {
          horarioRuta: {
            include: {
              ruta: {
                include: {
                  paradas: {
                    orderBy: { orden: 'asc' },
                  },
                },
              },
            },
          },
        },
      });

      if (!viaje) {
        throw new NotFoundException(
          `Viaje con ID ${datos.viajeId} no encontrado para el tenant ${tenantId}`,
        );
      }

      // 2. Validar paradas de origen y destino
      const paradas = viaje.horarioRuta.ruta.paradas;
      const paradaOrigen = paradas.find(p => p.ciudadId === datos.ciudadOrigenId);
      const paradaDestino = paradas.find(p => p.ciudadId === datos.ciudadDestinoId);

      if (!paradaOrigen) {
        throw new NotFoundException(
          `Ciudad de origen ${datos.ciudadOrigenId} no encontrada en la ruta`,
        );
      }

      if (!paradaDestino) {
        throw new NotFoundException(
          `Ciudad de destino ${datos.ciudadDestinoId} no encontrada en la ruta`,
        );
      }

      if (paradaOrigen.orden >= paradaDestino.orden) {
        throw new BadRequestException(
          'La ciudad de origen debe estar antes que la ciudad de destino en la ruta',
        );
      }

      // 3. Validar método de pago
      const metodoPago = await tx.metodoPago.findUnique({
        where: { id: datos.metodoPagoId, tenantId },
      });

      if (!metodoPago) {
        throw new NotFoundException(
          `Método de pago con ID ${datos.metodoPagoId} no encontrado`,
        );
      }

      // 4. Validar oficinista si se proporciona
      if (datos.oficinistaId) {
        const oficinista = await tx.usuarioTenant.findFirst({
          where: {
            id: datos.oficinistaId,
            tenantId,
            rol: { in: ['ADMIN_COOPERATIVA', 'OFICINISTA'] },
            activo: true,
          },
        });

        if (!oficinista) {
          throw new NotFoundException(
            `Oficinista con ID ${datos.oficinistaId} no encontrado`,
          );
        }
      }

      // 5. Validar disponibilidad de asientos
      const asientosIds = datos.boletos.map(b => b.asientoId);
      const asientosUnicos = [...new Set(asientosIds)];

      if (asientosIds.length !== asientosUnicos.length) {
        throw new BadRequestException('No se pueden duplicar asientos en la misma venta');
      }

      // Obtener asientos con sus tipos
      const asientos = await tx.asiento.findMany({
        where: {
          id: { in: asientosUnicos },
          estado: 'DISPONIBLE',
        },
        include: {
          tipo: true,
          pisoBus: {
            include: {
              bus: true,
            },
          },
        },
      });

      if (asientos.length !== asientosUnicos.length) {
        throw new BadRequestException('Algunos asientos no están disponibles');
      }

      // Validar que los asientos pertenecen al bus del viaje
      const asientosInvalidos = asientos.filter(
        a => a.pisoBus.bus.id !== viaje.busId,
      );

      if (asientosInvalidos.length > 0) {
        throw new BadRequestException(
          'Algunos asientos no pertenecen al bus del viaje',
        );
      }

      // 6. Verificar ocupaciones existentes para el segmento
      const ocupacionesExistentes = await tx.ocupacionAsiento.findMany({
        where: {
          viajeId: datos.viajeId,
          asientoId: { in: asientosUnicos },
          AND: [
            {
              paradaOrigen: {
                orden: { lt: paradaDestino.orden },
              },
            },
            {
              paradaDestino: {
                orden: { gt: paradaOrigen.orden },
              },
            },
          ],
        },
      });

      if (ocupacionesExistentes.length > 0) {
        throw new ConflictException(
          'Algunos asientos ya están ocupados para este segmento del viaje',
        );
      }

      // 7. Validar clientes
      const clientesIds = datos.boletos.map(b => b.clienteId);
      const clientes = await tx.cliente.findMany({
        where: { id: { in: clientesIds }, activo: true },
      });

      if (clientes.length !== clientesIds.length) {
        throw new NotFoundException('Algunos clientes no existen o están inactivos');
      }

      // 8. Calcular precios y descuentos
      const precioSegmento = paradaDestino.precioAcumulado.toNumber() - paradaOrigen.precioAcumulado.toNumber();
      
      let totalSinDescuento = 0;
      let totalDescuentos = 0;
      const boletosData = [];

      for (const boletoDto of datos.boletos) {
        const asiento = asientos.find(a => a.id === boletoDto.asientoId);
        const cliente = clientes.find(c => c.id === boletoDto.clienteId);
        const precioBase = precioSegmento * asiento.tipo.factorPrecio.toNumber();
        
        // Calcular descuento automáticamente basado en información del cliente
        const informacionDescuento = await this.descuentoCalculatorService.calcularDescuentoAutomatico(
          boletoDto.clienteId,
          tenantId,
        );

        // Si requiere validación, ejecutar validación
        if (informacionDescuento.requiereValidacion) {
          const validacion = await this.descuentoCalculatorService.validarRequisitosDescuento(
            boletoDto.clienteId,
            informacionDescuento.tipoDescuento,
          );

          if (!validacion.esValido) {
            throw new BadRequestException(
              `Error en descuento para cliente ${cliente.nombres} ${cliente.apellidos}: ${validacion.motivo}`,
            );
          }
        }

        const montoDescuento = (precioBase * informacionDescuento.porcentajeDescuento) / 100;
        const precioFinal = precioBase - montoDescuento;

        totalSinDescuento += precioBase;
        totalDescuentos += montoDescuento;

        boletosData.push({
          clienteId: boletoDto.clienteId,
          asientoId: boletoDto.asientoId,
          precioBase,
          tipoDescuento: informacionDescuento.tipoDescuento,
          porcentajeDescuento: informacionDescuento.porcentajeDescuento,
          precioFinal,
          codigoAcceso: this.generarCodigoAcceso(),
          descripcionDescuento: informacionDescuento.descripcion,
        });
      }

      const totalFinal = totalSinDescuento - totalDescuentos;

      // 9. Crear la venta
      const venta = await tx.venta.create({
        data: {
          tenantId,
          viajeId: datos.viajeId,
          usuarioId,
          oficinistaId: datos.oficinistaId,
          metodoPagoId: datos.metodoPagoId,
          totalSinDescuento,
          totalDescuentos,
          totalFinal,
          estadoPago: EstadoPago.PENDIENTE,
        },
      });

      // 10. Crear boletos y ocupaciones
      const boletos = [];
      const ocupaciones = [];

      for (const boletoData of boletosData) {
        const boleto = await tx.boleto.create({
          data: {
            tenantId,
            ventaId: venta.id,
            viajeId: datos.viajeId,
            clienteId: boletoData.clienteId,
            asientoId: boletoData.asientoId,
            paradaOrigenId: paradaOrigen.id,
            paradaDestinoId: paradaDestino.id,
            fechaViaje: viaje.fecha,
            horaSalida: new Date(`1970-01-01T${viaje.horarioRuta.horaSalida}:00`),
            precioBase: boletoData.precioBase,
            tipoDescuento: boletoData.tipoDescuento,
            porcentajeDescuento: boletoData.porcentajeDescuento,
            precioFinal: boletoData.precioFinal,
            codigoAcceso: boletoData.codigoAcceso,
            estado: EstadoBoleto.PENDIENTE,
          },
        });

        boletos.push(boleto);

        // Crear ocupación de asiento
        const ocupacion = await tx.ocupacionAsiento.create({
          data: {
            viajeId: datos.viajeId,
            asientoId: boletoData.asientoId,
            paradaOrigenId: paradaOrigen.id,
            paradaDestinoId: paradaDestino.id,
            boletoId: boleto.id,
          },
        });

        ocupaciones.push(ocupacion);
      }

      // 11. Actualizar contador de asientos ocupados del viaje
      await tx.viaje.update({
        where: { id: datos.viajeId },
        data: {
          asientosOcupados: {
            increment: boletos.length,
          },
        },
      });

      // 12. Obtener venta completa para retornar
      const ventaCompleta = await tx.venta.findUnique({
        where: { id: venta.id },
        select: VENTA_SELECT_WITH_FULL_RELATIONS,
      });

      // 13. Enviar email de confirmación de forma asíncrona (no bloqueante)
      setImmediate(async () => {
        try {
          await this.emailService.enviarConfirmacionVenta(venta.id);
        } catch (error) {
          // Log error but don't fail the transaction
          console.error('Error enviando email de confirmación:', error);
        }
      });

      return ventaCompleta;
    });
  }

  async actualizarEstadoVenta(
    id: number,
    datos: UpdateVentaDto,
    tenantId: number,
  ) {
    const venta = await this.obtenerVenta({ id, tenantId });

    return await this.prisma.venta.update({
      where: { id },
      data: datos,
      select: VENTA_SELECT_WITH_RELATIONS,
    });
  }

  async confirmarPago(id: number, tenantId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({
        where: { id, tenantId },
        include: { boletos: true },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      }

      if (venta.estadoPago === EstadoPago.APROBADO) {
        throw new BadRequestException('La venta ya está confirmada');
      }

      // Actualizar venta
      await tx.venta.update({
        where: { id },
        data: { estadoPago: EstadoPago.APROBADO },
      });

      // Actualizar boletos
      await tx.boleto.updateMany({
        where: { ventaId: id },
        data: { estado: EstadoBoleto.CONFIRMADO },
      });

      const ventaConfirmada = await tx.venta.findUnique({
        where: { id },
        select: VENTA_SELECT_WITH_FULL_RELATIONS,
      });

      // Enviar emails de boletos individuales de forma asíncrona
      setImmediate(async () => {
        try {
          for (const boleto of venta.boletos) {
            await this.emailService.enviarBoleto(boleto.id);
          }
        } catch (error) {
          console.error('Error enviando boletos por email:', error);
        }
      });

      return ventaConfirmada;
    });
  }

  async cancelarVenta(id: number, tenantId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const venta = await tx.venta.findUnique({
        where: { id, tenantId },
        include: { boletos: true },
      });

      if (!venta) {
        throw new NotFoundException(`Venta con ID ${id} no encontrada`);
      }

      if (venta.estadoPago === EstadoPago.APROBADO) {
        throw new BadRequestException('No se puede cancelar una venta confirmada');
      }

      // Eliminar ocupaciones
      await tx.ocupacionAsiento.deleteMany({
        where: {
          boletoId: { in: venta.boletos.map(b => b.id) },
        },
      });

      // Actualizar contador de asientos del viaje
      await tx.viaje.update({
        where: { id: venta.viajeId },
        data: {
          asientosOcupados: {
            decrement: venta.boletos.length,
          },
        },
      });

      // Actualizar boletos
      await tx.boleto.updateMany({
        where: { ventaId: id },
        data: { estado: EstadoBoleto.CANCELADO },
      });

      // Actualizar venta
      await tx.venta.update({
        where: { id },
        data: { estadoPago: EstadoPago.RECHAZADO },
      });

      return await tx.venta.findUnique({
        where: { id },
        select: VENTA_SELECT_WITH_FULL_RELATIONS,
      });
    });
  }

  private generarCodigoAcceso(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }

  async obtenerEstadisticasVentas(tenantId: number, fechaDesde?: Date, fechaHasta?: Date) {
    const where: Prisma.VentaWhereInput = { tenantId };

    if (fechaDesde || fechaHasta) {
      where.fechaVenta = {};
      if (fechaDesde) where.fechaVenta.gte = fechaDesde;
      if (fechaHasta) where.fechaVenta.lte = fechaHasta;
    }

    const [totalVentas, ventasAprobadas, ventasPendientes, montoTotal] = await Promise.all([
      this.prisma.venta.count({ where }),
      this.prisma.venta.count({ where: { ...where, estadoPago: EstadoPago.APROBADO } }),
      this.prisma.venta.count({ where: { ...where, estadoPago: EstadoPago.PENDIENTE } }),
      this.prisma.venta.aggregate({
        where: { ...where, estadoPago: EstadoPago.APROBADO },
        _sum: { totalFinal: true },
      }),
    ]);

    return {
      totalVentas,
      ventasAprobadas,
      ventasPendientes,
      ventasRechazadas: totalVentas - ventasAprobadas - ventasPendientes,
      montoTotalAprobado: montoTotal._sum.totalFinal || 0,
    };
  }
} 