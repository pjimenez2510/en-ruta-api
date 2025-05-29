import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class FiltroTipoAsientoDto {
  @ApiProperty({
    description: 'Filtrar por nombre',
    required: false,
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiProperty({
    description: 'Filtrar por descripción',
    required: false,
  })
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Filtrar por color',
    required: false,
  })
  @IsString({ message: 'El color debe ser una cadena de caracteres' })
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: 'Filtrar por icono',
    required: false,
  })
  @IsString({ message: 'El icono debe ser una cadena de caracteres' })
  @IsOptional()
  icono?: string;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  activo?: boolean = true;

  @ApiProperty({
    description: 'Filtrar por ID de tenant',
    required: false,
  })
  @IsNumber({}, { message: 'El ID del tenant debe ser un número' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  tenantId?: number;
}
