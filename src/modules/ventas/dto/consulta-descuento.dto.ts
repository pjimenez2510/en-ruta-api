import { ApiProperty } from '@nestjs/swagger';
import { TipoDescuentoCliente } from '@prisma/client';

export class DescuentoAplicableDto {
  @ApiProperty({
    description: 'Tipo de descuento aplicable',
    enum: TipoDescuentoCliente,
    example: TipoDescuentoCliente.TERCERA_EDAD,
  })
  tipoDescuento: TipoDescuentoCliente;

  @ApiProperty({
    description: 'Porcentaje de descuento aplicable',
    example: 15.0,
  })
  porcentajeDescuento: number;

  @ApiProperty({
    description: 'Si el descuento requiere validación adicional',
    example: true,
  })
  requiereValidacion: boolean;

  @ApiProperty({
    description: 'Descripción del descuento aplicable',
    example: 'Descuento por tercera edad (68 años)',
  })
  descripcion: string;

  @ApiProperty({
    description: 'Información de validación del descuento',
  })
  validacion: {
    esValido: boolean;
    motivo: string;
    detalles?: any;
  };

  @ApiProperty({
    description: 'Mensaje explicativo',
    example: 'Descuento aplicable: Descuento por tercera edad (68 años)',
  })
  mensaje: string;
} 