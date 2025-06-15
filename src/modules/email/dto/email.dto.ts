import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsArray } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    description: 'Dirección de email del destinatario',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  to: string;

  @ApiProperty({
    description: 'Asunto del email',
    example: 'Confirmación de compra - EnRuta',
  })
  @IsString({ message: 'El asunto debe ser una cadena de texto' })
  subject: string;

  @ApiProperty({
    description: 'Nombre de la plantilla a usar',
    example: 'venta-confirmacion',
  })
  @IsString({ message: 'La plantilla debe ser una cadena de texto' })
  template: string;

  @ApiProperty({
    description: 'Contexto/variables para la plantilla',
    example: { nombreCliente: 'Juan Pérez', numeroVenta: 123 },
  })
  @IsOptional()
  context?: Record<string, any>;
}

export class VentaEmailDto {
  @ApiProperty({
    description: 'ID de la venta',
    example: 1,
  })
  ventaId: number;

  @ApiProperty({
    description: 'Dirección de email del cliente',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  emailCliente: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
  nombreCliente: string;
}

export class BoletoEmailDto {
  @ApiProperty({
    description: 'ID del boleto',
    example: 1,
  })
  boletoId: number;

  @ApiProperty({
    description: 'Código de acceso del boleto',
    example: 'ABC12345',
  })
  @IsString({ message: 'El código de acceso debe ser una cadena de texto' })
  codigoAcceso: string;

  @ApiProperty({
    description: 'Dirección de email del cliente',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  emailCliente: string;
} 