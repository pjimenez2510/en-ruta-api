import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsHexColor,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTipoAsientoDto {
  @ApiProperty({
    description: 'Nombre del tipo de asiento',
    example: 'Asiento VIP',
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del tipo de asiento',
    example: 'Asientos con mayor comodidad y espacio',
  })
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Factor de precio relativo al precio base',
    example: 1.5,
    minimum: 0.01,
    maximum: 10.0,
    default: 1.0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'El factor de precio debe ser un número con máximo 2 decimales',
    },
  )
  @Min(0.01, { message: 'El factor de precio debe ser mayor a 0' })
  @Max(10.0, { message: 'El factor de precio no puede ser mayor a 10' })
  @Type(() => Number)
  factorPrecio: number;

  @ApiPropertyOptional({
    description:
      'Color representativo del tipo de asiento (código hexadecimal)',
    example: '#1E90FF',
  })
  @IsHexColor({ message: 'El color debe ser un código hexadecimal válido' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: 'Icono representativo del tipo de asiento',
    example: 'fa-chair-comfort',
  })
  @IsString({ message: 'El icono debe ser una cadena de caracteres' })
  @IsOptional()
  icono?: string;

  @ApiProperty({
    description: 'ID del tenant al que pertenece el tipo de asiento',
    example: 1,
    required: false,
  })
  @IsNumber({}, { message: 'El ID del tenant debe ser un número' })
  @Type(() => Number)
  @IsOptional()
  tenantId?: number;
}
