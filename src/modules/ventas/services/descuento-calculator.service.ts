import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoDescuento, TipoDescuentoCliente } from '@prisma/client';

export interface InformacionDescuento {
  tipoDescuento: TipoDescuentoCliente;
  porcentajeDescuento: number;
  requiereValidacion: boolean;
  descripcion: string;
}

@Injectable()
export class DescuentoCalculatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula automáticamente el descuento aplicable para un cliente específico
   */
  async calcularDescuentoAutomatico(
    clienteId: number,
    tenantId: number,
  ): Promise<InformacionDescuento> {
    // 1. Obtener información completa del cliente
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      select: {
        fechaNacimiento: true,
        esDiscapacitado: true,
        porcentajeDiscapacidad: true,
      },
    });

    if (!cliente) {
      return {
        tipoDescuento: TipoDescuentoCliente.NINGUNO,
        porcentajeDescuento: 0,
        requiereValidacion: false,
        descripcion: 'Cliente no encontrado',
      };
    }

    // 2. Obtener configuraciones de descuentos del tenant
    const configuracionesDescuento = await this.prisma.configuracionDescuento.findMany({
      where: {
        tenantId,
        activo: true,
      },
    });

    const configMap = new Map<TipoDescuento, { porcentaje: number; requiereValidacion: boolean }>();
    configuracionesDescuento.forEach(config => {
      configMap.set(config.tipo, {
        porcentaje: config.porcentaje.toNumber(),
        requiereValidacion: config.requiereValidacion,
      });
    });

    // 3. Calcular edad si hay fecha de nacimiento
    let edad: number | null = null;
    if (cliente.fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(cliente.fechaNacimiento);
      edad = hoy.getFullYear() - nacimiento.getFullYear();
      
      // Ajustar si aún no ha cumplido años este año
      const mesActual = hoy.getMonth();
      const mesNacimiento = nacimiento.getMonth();
      if (mesActual < mesNacimiento || 
          (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
    }

    // 4. Determinar descuentos aplicables (en orden de prioridad)
    const descuentosAplicables: Array<{
      tipo: TipoDescuentoCliente;
      config: { porcentaje: number; requiereValidacion: boolean };
      descripcion: string;
    }> = [];

    // Descuento por discapacidad (mayor prioridad)
    if (cliente.esDiscapacitado && configMap.has(TipoDescuento.DISCAPACIDAD)) {
      const config = configMap.get(TipoDescuento.DISCAPACIDAD)!;
      descuentosAplicables.push({
        tipo: TipoDescuentoCliente.DISCAPACIDAD,
        config,
        descripcion: `Descuento por discapacidad (${cliente.porcentajeDiscapacidad ? cliente.porcentajeDiscapacidad.toNumber() + '% discapacidad' : 'certificado'})`,
      });
    }

    // Descuento por menor edad
    if (edad !== null && edad < 18 && configMap.has(TipoDescuento.MENOR_EDAD)) {
      const config = configMap.get(TipoDescuento.MENOR_EDAD)!;
      descuentosAplicables.push({
        tipo: TipoDescuentoCliente.MENOR_EDAD,
        config,
        descripcion: `Descuento por menor de edad (${edad} años)`,
      });
    }

    // Descuento por tercera edad
    if (edad !== null && edad >= 65 && configMap.has(TipoDescuento.TERCERA_EDAD)) {
      const config = configMap.get(TipoDescuento.TERCERA_EDAD)!;
      descuentosAplicables.push({
        tipo: TipoDescuentoCliente.TERCERA_EDAD,
        config,
        descripcion: `Descuento por tercera edad (${edad} años)`,
      });
    }

    // 5. Aplicar el descuento de mayor porcentaje
    if (descuentosAplicables.length === 0) {
      return {
        tipoDescuento: TipoDescuentoCliente.NINGUNO,
        porcentajeDescuento: 0,
        requiereValidacion: false,
        descripcion: 'No aplica descuento',
      };
    }

    // Ordenar por mayor porcentaje de descuento
    descuentosAplicables.sort((a, b) => b.config.porcentaje - a.config.porcentaje);
    const mejorDescuento = descuentosAplicables[0];

    return {
      tipoDescuento: mejorDescuento.tipo,
      porcentajeDescuento: mejorDescuento.config.porcentaje,
      requiereValidacion: mejorDescuento.config.requiereValidacion,
      descripcion: mejorDescuento.descripcion,
    };
  }

  /**
   * Valida si un cliente cumple los requisitos para un tipo de descuento específico
   */
  async validarRequisitosDescuento(
    clienteId: number,
    tipoDescuento: TipoDescuentoCliente,
  ): Promise<{
    esValido: boolean;
    motivo: string;
    detalles?: any;
  }> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      select: {
        fechaNacimiento: true,
        esDiscapacitado: true,
        porcentajeDiscapacidad: true,
        nombres: true,
        apellidos: true,
      },
    });

    if (!cliente) {
      return {
        esValido: false,
        motivo: 'Cliente no encontrado',
      };
    }

    let edad: number | null = null;
    if (cliente.fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(cliente.fechaNacimiento);
      edad = hoy.getFullYear() - nacimiento.getFullYear();
      
      if (hoy.getMonth() < nacimiento.getMonth() || 
          (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
    }

    switch (tipoDescuento) {
      case TipoDescuentoCliente.MENOR_EDAD:
        if (!cliente.fechaNacimiento) {
          return {
            esValido: false,
            motivo: 'No se puede validar edad - fecha de nacimiento no registrada',
          };
        }
        if (edad === null || edad >= 18) {
          return {
            esValido: false,
            motivo: `El cliente tiene ${edad} años, no califica para descuento de menor edad`,
            detalles: { edadCalculada: edad },
          };
        }
        return {
          esValido: true,
          motivo: `Cliente califica para descuento de menor edad (${edad} años)`,
          detalles: { edadCalculada: edad },
        };

      case TipoDescuentoCliente.TERCERA_EDAD:
        if (!cliente.fechaNacimiento) {
          return {
            esValido: false,
            motivo: 'No se puede validar edad - fecha de nacimiento no registrada',
          };
        }
        if (edad === null || edad < 65) {
          return {
            esValido: false,
            motivo: `El cliente tiene ${edad} años, no califica para descuento de tercera edad`,
            detalles: { edadCalculada: edad },
          };
        }
        return {
          esValido: true,
          motivo: `Cliente califica para descuento de tercera edad (${edad} años)`,
          detalles: { edadCalculada: edad },
        };

      case TipoDescuentoCliente.DISCAPACIDAD:
        if (!cliente.esDiscapacitado) {
          return {
            esValido: false,
            motivo: 'El cliente no está marcado como persona con discapacidad',
          };
        }
        return {
          esValido: true,
          motivo: 'Cliente califica para descuento por discapacidad',
          detalles: { 
            porcentajeDiscapacidad: cliente.porcentajeDiscapacidad?.toNumber() 
          },
        };

      case TipoDescuentoCliente.NINGUNO:
        return {
          esValido: true,
          motivo: 'Sin descuento aplicado',
        };

      default:
        return {
          esValido: false,
          motivo: 'Tipo de descuento no reconocido',
        };
    }
  }
} 