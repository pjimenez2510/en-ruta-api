import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { EstadoBoleto } from '@prisma/client';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Ejecuta cada día minuto 
   */
  @Cron('0 0 * * *', {
    name: 'enviar-recordatorios-viaje',
    timeZone: 'America/Guayaquil', // Ajusta según tu zona horaria
  })
  async enviarRecordatoriosViaje() {
    this.logger.log('Iniciando envío de recordatorios de viaje...');

    try {
      // Calcular fecha de mañana
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      mañana.setHours(0, 0, 0, 0);

      const finMañana = new Date(mañana);
      finMañana.setHours(23, 59, 59, 999);

      // Buscar boletos confirmados con viaje mañana que no hayan recibido recordatorio
      const boletos = await this.prisma.boleto.findMany({
        where: {
          estado: EstadoBoleto.CONFIRMADO,
          fechaViaje: {
            gte: mañana,
            lte: finMañana,
          },
          recordatorioEnviado: false, // Solo boletos que no han recibido recordatorio
        },
        include: {
          cliente: true,
        },
      });

      this.logger.log(`Encontrados ${boletos.length} boletos para recordatorio`);

      let exitosos = 0;
      let fallidos = 0;

      // Enviar recordatorios uno por uno
      for (const boleto of boletos) {
        try {
          if (boleto.cliente.email) {
            const resultado = await this.emailService.enviarRecordatorioViaje(boleto.id);
            
            if (resultado) {
              // Marcar recordatorio como enviado
              await this.prisma.boleto.update({
                where: { id: boleto.id },
                data: { recordatorioEnviado: true },
              });
              exitosos++;
              this.logger.debug(`Recordatorio enviado para boleto ${boleto.codigoAcceso}`);
            } else {
              fallidos++;
              this.logger.warn(`Error enviando recordatorio para boleto ${boleto.codigoAcceso}`);
            }
          } else {
            this.logger.warn(`Boleto ${boleto.codigoAcceso} sin email del cliente`);
            fallidos++;
          }

          // Pausa pequeña para no sobrecargar el servidor de email
          await this.sleep(100);
        } catch (error) {
          fallidos++;
          this.logger.error(`Error procesando boleto ${boleto.codigoAcceso}:`, error);
        }
      }

      this.logger.log(
        `Recordatorios enviados: ${exitosos} exitosos, ${fallidos} fallidos`
      );
    } catch (error) {
      this.logger.error('Error en el proceso de recordatorios:', error);
    }
  }

  /**
   * Ejecuta cada hora para reenviar emails fallidos
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'reintentar-emails-fallidos',
  })
  async reintentarEmailsFallidos() {
    this.logger.debug('Verificando emails fallidos para reintento...');

    try {
      // Aquí puedes implementar lógica para reintentar emails fallidos
      // Por ejemplo, mantener una tabla de emails pendientes y reintentarlos
      
      // Esta es una implementación básica - puedes expandirla según necesites
      const haceUnaHora = new Date();
      haceUnaHora.setHours(haceUnaHora.getHours() - 1);

      // Buscar ventas recientes sin email de confirmación enviado
      const ventasSinEmail = await this.prisma.venta.findMany({
        where: {
          fechaVenta: {
            gte: haceUnaHora,
          },
          // Puedes agregar un campo emailConfirmacionEnviado si lo necesitas
        },
        include: {
          comprador: {
            include: {
              cliente: true,
            },
          },
        },
        take: 10, // Limitar a 10 por hora para no sobrecargar
      });

      for (const venta of ventasSinEmail) {
        if (venta.comprador?.cliente?.email) {
          try {
            await this.emailService.enviarConfirmacionVenta(venta.id);
            this.logger.debug(`Reintentado email de confirmación para venta ${venta.id}`);
            await this.sleep(500); // Pausa entre envíos
          } catch (error) {
            this.logger.warn(`Error reintentando email para venta ${venta.id}:`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error en el proceso de reintento de emails:', error);
    }
  }

  /**
   * Ejecuta cada lunes a las 8:00 AM para generar reportes de emails
   */
  @Cron('0 8 * * 1', {
    name: 'reporte-semanal-emails',
  })
  async generarReporteSemanal() {
    this.logger.log('Generando reporte semanal de emails...');

    try {
      const haceUnaSemana = new Date();
      haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

      // Estadísticas de ventas con emails
      const ventasConEmail = await this.prisma.venta.count({
        where: {
          fechaVenta: {
            gte: haceUnaSemana,
          },
          comprador: {
            cliente: {
              email: {
                not: null,
              },
            },
          },
        },
      });

      const totalVentas = await this.prisma.venta.count({
        where: {
          fechaVenta: {
            gte: haceUnaSemana,
          },
        },
      });

      // Estadísticas de boletos con recordatorios
      const boletosConRecordatorio = await this.prisma.boleto.count({
        where: {
          fechaViaje: {
            gte: haceUnaSemana,
          },
          recordatorioEnviado: true,
        },
      });

      const reporte = {
        periodo: `${haceUnaSemana.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
        totalVentas,
        ventasConEmail,
        porcentajeCobertura: totalVentas > 0 ? (ventasConEmail / totalVentas * 100).toFixed(2) : '0',
        boletosConRecordatorio,
      };

      this.logger.log('📊 Reporte semanal de emails:', reporte);

      // Aquí puedes enviar este reporte por email a los administradores
      // await this.enviarReporteAAdministradores(reporte);
    } catch (error) {
      this.logger.error('Error generando reporte semanal:', error);
    }
  }

  /**
   * Función auxiliar para pausas entre operaciones
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Función para obtener estadísticas en tiempo real
   */
  async obtenerEstadisticasEmails(dias: number = 7) {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const [
      totalVentas,
      ventasConEmail,
      recordatoriosEnviados,
      boletosConfirmados,
    ] = await Promise.all([
      this.prisma.venta.count({
        where: { fechaVenta: { gte: fechaInicio } },
      }),
      this.prisma.venta.count({
        where: {
          fechaVenta: { gte: fechaInicio },
          comprador: {
            cliente: { email: { not: null } },
          },
        },
      }),
      this.prisma.boleto.count({
        where: {
          fechaViaje: { gte: fechaInicio },
          recordatorioEnviado: true,
        },
      }),
      this.prisma.boleto.count({
        where: {
          fechaViaje: { gte: fechaInicio },
          estado: EstadoBoleto.CONFIRMADO,
        },
      }),
    ]);

    return {
      periodo: `Últimos ${dias} días`,
      totalVentas,
      ventasConEmail,
      porcentajeCobertura: totalVentas > 0 ? (ventasConEmail / totalVentas * 100).toFixed(2) : '0',
      recordatoriosEnviados,
      boletosConfirmados,
      tasaRecordatorios: boletosConfirmados > 0 ? (recordatoriosEnviados / boletosConfirmados * 100).toFixed(2) : '0',
    };
  }
} 