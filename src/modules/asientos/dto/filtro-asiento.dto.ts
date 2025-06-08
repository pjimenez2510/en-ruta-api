import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EstadoAsiento } from '@prisma/client';

export class FiltroAsientoDto {
  @ApiProperty({
    description: 'Filtrar por ID de bus',
    required: false,
  })
  @IsInt({ message: 'El ID del bus debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  busId?: number;

  @ApiProperty({
    description: 'Filtrar por ID de piso de bus',
    required: false,
  })
  @IsInt({ message: 'El ID del piso de bus debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  pisoBusId?: number;

  @ApiProperty({
    description: 'Filtrar por número de asiento',
    required: false,
  })
  @IsString({ message: 'El número debe ser un texto' })
  @IsOptional()
  numero?: string;

  @ApiProperty({
    description: 'Filtrar por fila',
    required: false,
  })
  @IsInt({ message: 'La fila debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  fila?: number;

  @ApiProperty({
    description: 'Filtrar por columna',
    required: false,
  })
  @IsInt({ message: 'La columna debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  columna?: number;

  @ApiProperty({
    description: 'Filtrar por tipo de asiento',
    required: false,
  })
  @IsInt({ message: 'El ID del tipo de asiento debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  tipoId?: number;

  @ApiProperty({
    description: 'Filtrar por estado',
    required: false,
    enum: EstadoAsiento,
  })
  @IsEnum(EstadoAsiento, { message: 'El estado debe ser un valor válido' })
  @IsOptional()
  estado?: EstadoAsiento;
}
