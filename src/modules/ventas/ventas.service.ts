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
import { Logger } from '@nestjs/common';

@Injectable()
export class VentasService {
  private readonly logger = new Logger(VentasService.name);

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
    // 🚀 OPTIMIZACIÓN: Hacer cálculos pesados ANTES de la transacción
    this.logger.log(`[VentasService] Iniciando pre-cálculos para ${datos.boletos.length} boletos`);
    
    // Verificar si tenemos demasiados boletos para una sola transacción
    if (datos.boletos.length > 50) {
      throw new BadRequestException('Máximo 50 boletos por venta. Para ventas masivas, use múltiples transacciones.');
    }
    
    // 1. Pre-validar clientes (fuera de transacción)
    const clientesIds = datos.boletos.map(b => b.clienteId);
    const clientes = await this.prisma.cliente.findMany({
      where: { id: { in: clientesIds }, activo: true },
    });

    if (clientes.length !== clientesIds.length) {
      throw new NotFoundException('Algunos clientes no existen o están inactivos');
    }

    // 2. Pre-calcular todos los descuentos (fuera de transacción)
    const descuentosCalculados = new Map();
    for (const boletoDto of datos.boletos) {
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
          const cliente = clientes.find(c => c.id === boletoDto.clienteId);
          throw new BadRequestException(
            `Error en descuento para cliente ${cliente.nombres} ${cliente.apellidos}: ${validacion.motivo}`,
          );
        }
      }

      descuentosCalculados.set(boletoDto.clienteId, informacionDescuento);
    }

    this.logger.log(`[VentasService] Pre-cálculos completados. Iniciando transacción`);

    // 🚀 TRANSACCIÓN OPTIMIZADA CON REINTENTOS: Solo operaciones de base de datos
    const ventaCompleta = await this.executeTransactionWithRetries(async (tx) => {
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

      // 7. Usar datos pre-calculados (súper rápido dentro de la transacción)
      const precioSegmento = paradaDestino.precioAcumulado.toNumber() - paradaOrigen.precioAcumulado.toNumber();
      
      let totalSinDescuento = 0;
      let totalDescuentos = 0;
      const boletosData = [];

      for (const boletoDto of datos.boletos) {
        const asiento = asientos.find(a => a.id === boletoDto.asientoId);
        const informacionDescuento = descuentosCalculados.get(boletoDto.clienteId);
        const precioBase = precioSegmento * asiento.tipo.factorPrecio.toNumber();
        
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

      // 8. Crear la venta
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

      // 9. Crear boletos de forma eficiente
      const boletosToCreate = boletosData.map(boletoData => ({
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
      }));

      // Crear boletos en lotes
      await tx.boleto.createMany({
        data: boletosToCreate,
      });

      // Obtener los boletos creados para las ocupaciones
      const boletos = await tx.boleto.findMany({
        where: { ventaId: venta.id },
        select: { id: true, asientoId: true },
      });

      // Crear ocupaciones de asientos
      const ocupacionesToCreate = boletos.map(boleto => ({
        viajeId: datos.viajeId,
        asientoId: boleto.asientoId,
        paradaOrigenId: paradaOrigen.id,
        paradaDestinoId: paradaDestino.id,
        boletoId: boleto.id,
      }));

      await tx.ocupacionAsiento.createMany({
        data: ocupacionesToCreate,
      });

      // 10. Actualizar contador de asientos ocupados del viaje
      await tx.viaje.update({
        where: { id: datos.viajeId },
        data: {
          asientosOcupados: {
            increment: boletos.length,
          },
        },
      });

      // 11. Obtener venta completa para retornar
      const ventaCompleta = await tx.venta.findUnique({
        where: { id: venta.id },
        select: VENTA_SELECT_WITH_FULL_RELATIONS,
      });

      return ventaCompleta;
    });

    this.logger.log(`[VentasService] Transacción completada exitosamente para venta ${ventaCompleta.id}`);

    // ✅ Enviar email DESPUÉS de que la transacción se haya completado exitosamente
    setImmediate(async () => {
      try {
        this.logger.log(`[VentasService] Iniciando envío de email de confirmación para venta ${ventaCompleta.id}`);
        const emailResult = await this.emailService.enviarConfirmacionVenta(ventaCompleta.id);
        if (emailResult) {
          this.logger.log(`[VentasService] Email de confirmación enviado exitosamente para venta ${ventaCompleta.id}`);
        } else {
          this.logger.warn(`[VentasService] No se pudo enviar email de confirmación para venta ${ventaCompleta.id}`);
        }
      } catch (error) {
        // Log error but don't fail the transaction (ya fue committeada)
        this.logger.error(`[VentasService] Error enviando email de confirmación para venta ${ventaCompleta.id}:`, error);
      }
    });

    return ventaCompleta;
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
    // Ejecutar la transacción primero
    const result = await this.prisma.$transaction(async (tx) => {
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

      return {
        ventaConfirmada,
        boletosIds: venta.boletos.map(b => b.id), // IDs de boletos para enviar emails
      };
    });

    // ✅ SOLUCIÓN: Enviar emails DESPUÉS de que la transacción se haya completado exitosamente
    setImmediate(async () => {
      try {
        this.logger.log(`[VentasService] Transacción de confirmación completada. Iniciando envío de boletos individuales para venta ${id}, total boletos: ${result.boletosIds.length}`);
        let exitosos = 0;
        let fallidos = 0;
        
        for (const boletoId of result.boletosIds) {
          try {
            const resultado = await this.emailService.enviarBoleto(boletoId);
            if (resultado) {
              exitosos++;
              this.logger.debug(`[VentasService] Boleto ${boletoId} enviado exitosamente`);
            } else {
              fallidos++;
              this.logger.warn(`[VentasService] Error enviando boleto ${boletoId}`);
            }
            
            // Pausa pequeña para no sobrecargar el servidor de email
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            fallidos++;
            this.logger.error(`[VentasService] Error enviando boleto ${boletoId}:`, error);
          }
        }
        
        this.logger.log(`[VentasService] Finalizado envío de boletos para venta ${id}: ${exitosos} exitosos, ${fallidos} fallidos`);
      } catch (error) {
        this.logger.error(`[VentasService] Error general enviando boletos por email para venta ${id}:`, error);
      }
    });

    return result.ventaConfirmada;
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

  /**
   * Ejecuta una transacción con reintentos automáticos
   */
  private async executeTransactionWithRetries<T>(
    transactionFn: (tx: any) => Promise<T>,
    maxRetries: number = 3,
    timeoutMs: number = 60000,
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(`[VentasService] Intento de transacción ${attempt}/${maxRetries}`);
        
        return await this.prisma.$transaction(transactionFn, {
          timeout: timeoutMs,
          maxWait: 10000,
        });
      } catch (error) {
        lastError = error;
        this.logger.warn(`[VentasService] Intento ${attempt} falló:`, error.message);
        
        // Si es un error de transacción cerrada y no es el último intento, retry
        if (
          (error.code === 'P2028' || error.message?.includes('Transaction not found')) &&
          attempt < maxRetries
        ) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Backoff exponencial: 1s, 2s, 4s
          this.logger.log(`[VentasService] Reintentando en ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Para otros errores o último intento, lanzar el error
        throw error;
      }
    }
    
    throw lastError;
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