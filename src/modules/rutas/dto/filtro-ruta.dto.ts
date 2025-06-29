import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class FiltroRutaDto {
  @ApiProperty({
    description: 'Filtrar por nombre de ruta',
    required: false,
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiProperty({
    description: 'Filtrar por ID de tipo de ruta de bus',
    required: false,
  })
  @IsInt({ message: 'El ID del tipo de ruta de bus debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  tipoRutaBusId?: number;

  @ApiProperty({
    description: 'Filtrar por ID de resolución ANT',
    required: false,
  })
  @IsInt({ message: 'El ID de la resolución debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  resolucionId?: number;

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