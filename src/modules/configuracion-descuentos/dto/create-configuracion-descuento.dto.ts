import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { TipoDescuento } from '@prisma/client';

export class CreateConfiguracionDescuentoDto {
  @ApiProperty({
    description: 'Tipo de descuento',
    enum: TipoDescuento,
    example: TipoDescuento.MENOR_EDAD,
  })
  @IsEnum(TipoDescuento, { message: 'El tipo de descuento debe ser válido' })
  @IsNotEmpty({ message: 'El tipo de descuento es requerido' })
  tipo: TipoDescuento;

  @ApiProperty({
    description: 'Porcentaje de descuento (0-100)',
    example: 15.50,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El porcentaje debe ser un número válido con máximo 2 decimales' })
  @IsNotEmpty({ message: 'El porcentaje es requerido' })
  @Min(0, { message: 'El porcentaje debe ser mayor o igual a 0' })
  @Max(100, { message: 'El porcentaje debe ser menor o igual a 100' })
  porcentaje: number;

  @ApiPropertyOptional({
    description: 'Indica si el descuento requiere validación adicional',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo requiere validación debe ser un valor booleano' })
  requiereValidacion?: boolean;

  @ApiPropertyOptional({
    description: 'Estado de la configuración',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 