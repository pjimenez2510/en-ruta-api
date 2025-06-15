import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { TipoDescuento } from '@prisma/client';

export class FiltroConfiguracionDescuentoDto {
  @ApiProperty({
    description: 'Filtrar por tipo de descuento',
    enum: TipoDescuento,
    required: false,
  })
  @IsEnum(TipoDescuento, { message: 'El tipo de descuento debe ser válido' })
  @IsOptional()
  tipo?: TipoDescuento;

  @ApiProperty({
    description: 'Filtrar por porcentaje mínimo',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El porcentaje mínimo debe ser un número válido' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @Min(0, { message: 'El porcentaje mínimo debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje mínimo debe ser menor o igual a 100' })
  porcentajeMinimo?: number;

  @ApiProperty({
    description: 'Filtrar por porcentaje máximo',
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El porcentaje máximo debe ser un número válido' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @Min(0, { message: 'El porcentaje máximo debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje máximo debe ser menor o igual a 100' })
  porcentajeMaximo?: number;

  @ApiProperty({
    description: 'Filtrar por requerimiento de validación',
    required: false,
  })
  @IsBoolean({ message: 'El campo requiere validación debe ser un valor booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  requiereValidacion?: boolean;

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