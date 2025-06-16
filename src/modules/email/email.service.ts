import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma/prisma.service';
import { SendEmailDto } from './dto/email.dto';
import { TemplatePathUtil } from './utils/template-path.util';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Método genérico para enviar emails con plantillas
   */
  async sendEmail(sendEmailDto: SendEmailDto): Promise<boolean> {
    try {
      this.logger.debug(`[EmailService] Iniciando envío de email a: ${sendEmailDto.to}, plantilla: ${sendEmailDto.template}`);
      
      // Verificar que la plantilla existe antes de intentar enviar
      if (!TemplatePathUtil.templateExists(sendEmailDto.template)) {
        const availableTemplates = TemplatePathUtil.getAvailableTemplates();
        this.logger.error(
          `Plantilla '${sendEmailDto.template}' no encontrada. Plantillas disponibles: ${availableTemplates.join(', ')}`
        );
        this.logger.error(`Directorio de plantillas: ${TemplatePathUtil.getTemplatesDirectory()}`);
        return false;
      }

      this.logger.debug(`[EmailService] Plantilla ${sendEmailDto.template} encontrada, enviando email...`);

      await this.mailerService.sendMail({
        to: sendEmailDto.to,
        subject: sendEmailDto.subject,
        template: sendEmailDto.template,
        context: sendEmailDto.context,
      });

      this.logger.log(`[EmailService] Email enviado exitosamente a: ${sendEmailDto.to}`);
      return true;
    } catch (error) {
      this.logger.error(`[EmailService] Error enviando email a ${sendEmailDto.to}:`, error);
      
      // Información adicional para debugging
      this.logger.error(`[EmailService] Detalles del error:`);
      this.logger.error(`  - Plantilla solicitada: ${sendEmailDto.template}`);
      this.logger.error(`  - Directorio de plantillas: ${TemplatePathUtil.getTemplatesDirectory()}`);
      this.logger.error(`  - Plantillas disponibles: ${TemplatePathUtil.getAvailableTemplates().join(', ')}`);
      this.logger.error(`  - Destinatario: ${sendEmailDto.to}`);
      this.logger.error(`  - Asunto: ${sendEmailDto.subject}`);
      
      if (error.message) {
        this.logger.error(`  - Mensaje de error: ${error.message}`);
      }
      
      return false;
    }
  }

  /**
   * Envía confirmación de venta al cliente
   */
  async enviarConfirmacionVenta(ventaId: number): Promise<boolean> {
    try {
      this.logger.log(`[EmailService] Obteniendo datos para venta ${ventaId}`);
      
      // Obtener datos completos de la venta con relaciones explícitas
      const venta = await this.prisma.venta.findUnique({
        where: { id: ventaId },
        include: {
          tenant: true,
          viaje: {
            include: {
              horarioRuta: {
                include: {
                  ruta: true,
                },
              },
              bus: true,
            },
          },
          comprador: {
            include: {
              cliente: true,
            },
          },
          metodoPago: true,
          boletos: {
            include: {
              cliente: true,
              asiento: {
                include: {
                  tipo: true,
                },
              },
              paradaOrigen: {
                include: {
                  ciudad: true,
                },
              },
              paradaDestino: {
                include: {
                  ciudad: true,
                },
              },
            },
          },
        },
      });

      if (!venta) {
        this.logger.error(`Venta con ID ${ventaId} no encontrada`);
        return false;
      }

      this.logger.log(`[EmailService] Venta ${ventaId} encontrada con ${venta.boletos.length} boletos`);

      // 🔧 CORRECCIÓN: Solo enviar al COMPRADOR, no a cada cliente individual
      const emailComprador = venta.comprador?.cliente?.email;
      
      if (!emailComprador) {
        this.logger.warn(`No se encontró email del comprador para la venta ${ventaId}`);
        return false;
      }

      const nombreComprador = `${venta.comprador.cliente.nombres} ${venta.comprador.cliente.apellidos}`;
      
      this.logger.log(`[EmailService] Enviando confirmación al comprador: ${emailComprador}`);

      // Preparar contexto para la plantilla con TODOS los boletos
      const context = {
        // Información del comprador (quien hizo la compra)
        nombreCliente: nombreComprador,
        emailCliente: emailComprador,
        
        // Información de la venta
        numeroVenta: venta.id,
        fechaVenta: venta.fechaVenta.toLocaleDateString('es-ES'),
        totalVenta: venta.totalFinal.toFixed(2),
        totalSinDescuento: venta.totalSinDescuento.toFixed(2),
        totalDescuentos: venta.totalDescuentos.toFixed(2),
        estadoPago: venta.estadoPago,
        metodoPago: venta.metodoPago.nombre,
        
        // Información del viaje
        nombreRuta: venta.viaje.horarioRuta.ruta.nombre,
        fechaViaje: venta.viaje.fecha.toLocaleDateString('es-ES'),
        horaSalida: venta.viaje.horarioRuta.horaSalida,
        numeroAutobus: venta.viaje.bus.numero,
        placaAutobus: venta.viaje.bus.placa,
        
        // 🔧 CORRECCIÓN: TODOS los boletos de la venta (no filtrados por cliente)
        boletos: venta.boletos.map(boleto => ({
          codigoAcceso: boleto.codigoAcceso,
          nombrePasajero: `${boleto.cliente.nombres} ${boleto.cliente.apellidos}`,
          documentoPasajero: boleto.cliente.numeroDocumento,
          numeroAsiento: boleto.asiento.numero,
          ciudadOrigen: boleto.paradaOrigen.ciudad.nombre,
          ciudadDestino: boleto.paradaDestino.ciudad.nombre,
          precio: boleto.precioFinal.toFixed(2),
          precioBase: boleto.precioBase.toFixed(2),
          tipoDescuento: boleto.tipoDescuento,
          porcentajeDescuento: boleto.porcentajeDescuento,
          montoDescuento: (boleto.precioBase.toNumber() - boleto.precioFinal.toNumber()).toFixed(2),
        })),
        
        // Información de la cooperativa
        nombreCooperativa: venta.tenant.nombre,
        
        // Información adicional
        totalBoletos: venta.boletos.length,
        hayDescuentos: venta.totalDescuentos.toNumber() > 0,
      };

      const resultado = await this.sendEmail({
        to: emailComprador,
        subject: `Confirmación de compra #${venta.id} - ${venta.tenant.nombre}`,
        template: 'venta-confirmacion',
        context,
      });

      if (resultado) {
        this.logger.log(`[EmailService] Email de confirmación enviado exitosamente al comprador: ${emailComprador}`);
      } else {
        this.logger.warn(`[EmailService] Error enviando email de confirmación al comprador: ${emailComprador}`);
      }
      
      return resultado;
    } catch (error) {
      this.logger.error(`Error enviando confirmación de venta ${ventaId}:`, error);
      return false;
    }
  }

  /**
   * Envía boleto individual al cliente
   */
  async enviarBoleto(boletoId: number): Promise<boolean> {
    try {
      const boleto = await this.prisma.boleto.findUnique({
        where: { id: boletoId },
        include: {
          tenant: true,
          cliente: true,
          viaje: {
            include: {
              horarioRuta: {
                include: {
                  ruta: true,
                },
              },
              bus: true,
            },
          },
          asiento: {
            include: {
              tipo: true,
            },
          },
          paradaOrigen: {
            include: {
              ciudad: true,
            },
          },
          paradaDestino: {
            include: {
              ciudad: true,
            },
          },
        },
      });

      if (!boleto) {
        this.logger.error(`Boleto con ID ${boletoId} no encontrado`);
        return false;
      }

      const emailCliente = boleto.cliente.email;
      if (!emailCliente) {
        this.logger.warn(`No se encontró email para el boleto ${boletoId}`);
        return false;
      }

      const context = {
        // Información del cliente
        nombreCliente: `${boleto.cliente.nombres} ${boleto.cliente.apellidos}`,
        emailCliente,
        
        // Información del boleto
        codigoAcceso: boleto.codigoAcceso,
        estado: boleto.estado,
        precio: boleto.precioFinal.toFixed(2),
        
        // Información del viaje
        fechaViaje: boleto.fechaViaje.toLocaleDateString('es-ES'),
        horaSalida: boleto.horaSalida.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        nombreRuta: boleto.viaje.horarioRuta.ruta.nombre,
        numeroAutobus: boleto.viaje.bus.numero,
        placaAutobus: boleto.viaje.bus.placa,
        
        // Información del asiento
        numeroAsiento: boleto.asiento.numero,
        tipoAsiento: boleto.asiento.tipo.nombre,
        
        // Información de ubicación
        ciudadOrigen: boleto.paradaOrigen.ciudad.nombre,
        provinciaOrigen: boleto.paradaOrigen.ciudad.provincia,
        ciudadDestino: boleto.paradaDestino.ciudad.nombre,
        provinciaDestino: boleto.paradaDestino.ciudad.provincia,
        
        // Información de la cooperativa
        nombreCooperativa: boleto.tenant.nombre,
      };

      return await this.sendEmail({
        to: emailCliente,
        subject: `Tu boleto ${boleto.codigoAcceso} - ${boleto.tenant.nombre}`,
        template: 'boleto-individual',
        context,
      });
    } catch (error) {
      this.logger.error(`Error enviando boleto ${boletoId}:`, error);
      return false;
    }
  }

  /**
   * Envía recordatorio de viaje (24 horas antes)
   */
  async enviarRecordatorioViaje(boletoId: number): Promise<boolean> {
    try {
      const boleto = await this.prisma.boleto.findUnique({
        where: { id: boletoId },
        include: {
          tenant: true,
          cliente: true,
          viaje: {
            include: {
              horarioRuta: {
                include: {
                  ruta: true,
                },
              },
            },
          },
          asiento: true,
          paradaOrigen: {
            include: {
              ciudad: true,
            },
          },
        },
      });

      if (!boleto || !boleto.cliente.email) {
        return false;
      }

      const context = {
        nombreCliente: `${boleto.cliente.nombres} ${boleto.cliente.apellidos}`,
        codigoAcceso: boleto.codigoAcceso,
        fechaViaje: boleto.fechaViaje.toLocaleDateString('es-ES'),
        horaSalida: boleto.horaSalida.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        nombreRuta: boleto.viaje.horarioRuta.ruta.nombre,
        numeroAsiento: boleto.asiento.numero,
        ciudadOrigen: boleto.paradaOrigen.ciudad.nombre,
        nombreCooperativa: boleto.tenant.nombre,
      };

      return await this.sendEmail({
        to: boleto.cliente.email,
        subject: `Recordatorio: Tu viaje es mañana - ${boleto.tenant.nombre}`,
        template: 'recordatorio-viaje',
        context,
      });
    } catch (error) {
      this.logger.error(`Error enviando recordatorio para boleto ${boletoId}:`, error);
      return false;
    }
  }

  /**
   * Envía notificación de cambio de estado de boleto
   */
  async enviarCambioEstadoBoleto(boletoId: number, nuevoEstado: string): Promise<boolean> {
    try {
      const boleto = await this.prisma.boleto.findUnique({
        where: { id: boletoId },
        include: {
          tenant: true,
          cliente: true,
          viaje: {
            include: {
              horarioRuta: {
                include: {
                  ruta: true,
                },
              },
            },
          },
        },
      });

      if (!boleto || !boleto.cliente.email) {
        return false;
      }

      const context = {
        nombreCliente: `${boleto.cliente.nombres} ${boleto.cliente.apellidos}`,
        codigoAcceso: boleto.codigoAcceso,
        nuevoEstado,
        fechaViaje: boleto.fechaViaje.toLocaleDateString('es-ES'),
        nombreRuta: boleto.viaje.horarioRuta.ruta.nombre,
        nombreCooperativa: boleto.tenant.nombre,
        
        // 🔧 SOLUCIÓN: Variables booleanas para simplificar las condicionales
        esConfirmado: nuevoEstado === 'CONFIRMADO',
        esCancelado: nuevoEstado === 'CANCELADO',
        esAbordado: nuevoEstado === 'ABORDADO',
        esNoShow: nuevoEstado === 'NO_SHOW',
        esPendiente: nuevoEstado === 'PENDIENTE',
      };

      return await this.sendEmail({
        to: boleto.cliente.email,
        subject: `Actualización de boleto ${boleto.codigoAcceso} - ${boleto.tenant.nombre}`,
        template: 'cambio-estado-boleto',
        context,
      });
    } catch (error) {
      this.logger.error(`Error enviando cambio de estado para boleto ${boletoId}:`, error);
      return false;
    }
  }
} 