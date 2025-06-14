import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
} from 'class-validator';

export class FiltroParadaRutaDto {
  @ApiProperty({
    description: 'Filtrar por ID de ruta',
    required: false,
  })
  @IsInt({ message: 'El ID de la ruta debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  rutaId?: number;

  @ApiProperty({
    description: 'Filtrar por ID de ciudad',
    required: false,
  })
  @IsInt({ message: 'El ID de la ciudad debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  ciudadId?: number;

  @ApiProperty({
    description: 'Filtrar por orden específico',
    required: false,
  })
  @IsInt({ message: 'El orden debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  orden?: number;
} 