import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMetodoPagoDto {
  @ApiProperty({
    description: 'Nombre del método de pago',
    example: 'Tarjeta de Crédito',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del método de pago',
    example: 'Pago con tarjeta de crédito mediante pasarela de pagos',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Procesador de pagos utilizado',
    example: 'Stripe',
  })
  @IsOptional()
  @IsString({ message: 'El procesador debe ser una cadena de caracteres' })
  @MaxLength(100, { message: 'El procesador no puede exceder 100 caracteres' })
  procesador?: string;

  @ApiPropertyOptional({
    description: 'Configuración específica del método de pago en formato JSON',
    example: '{"apiKey": "sk_test_...", "webhook": "https://..."}',
  })
  @IsOptional()
  @IsString({ message: 'La configuración debe ser una cadena de caracteres' })
  configuracion?: string;

  @ApiPropertyOptional({
    description: 'Estado del método de pago',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 