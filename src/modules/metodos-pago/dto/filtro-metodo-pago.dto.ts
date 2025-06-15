import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class FiltroMetodoPagoDto {
  @ApiProperty({
    description: 'Filtrar por nombre del método de pago',
    required: false,
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsOptional()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @ApiProperty({
    description: 'Filtrar por procesador de pagos',
    required: false,
  })
  @IsString({ message: 'El procesador debe ser una cadena de caracteres' })
  @IsOptional()
  @MaxLength(100, { message: 'El procesador no puede exceder 100 caracteres' })
  procesador?: string;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  activo?: boolean;
} 