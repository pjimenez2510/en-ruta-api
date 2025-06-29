import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoBus } from '@prisma/client';

export class FiltroBusDto {
  @ApiProperty({
    description: 'Filtrar por número de bus',
    required: false,
  })
  @IsInt({ message: 'El número debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  numero?: number;

  @ApiProperty({
    description: 'Filtrar por placa',
    required: false,
  })
  @IsString({ message: 'La placa debe ser una cadena de caracteres' })
  @IsOptional()
  placa?: string;

  @ApiProperty({
    description: 'Filtrar por año de fabricación',
    required: false,
  })
  @IsInt({ message: 'El año de fabricación debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  anioFabricacion?: number;

  @ApiProperty({
    description: 'Filtrar por tipo de combustible',
    required: false,
  })
  @IsString({
    message: 'El tipo de combustible debe ser una cadena de caracteres',
  })
  @IsOptional()
  tipoCombustible?: string;

  @ApiProperty({
    description: 'Filtrar por ID de modelo de bus',
    required: false,
  })
  @IsInt({ message: 'El ID del modelo debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  modeloBusId?: number;

  @ApiProperty({
    description: 'Filtrar por ID de tipo de ruta de bus',
    required: false,
  })
  @IsInt({ message: 'El ID del tipo de ruta de bus debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  tipoRutaBusId?: number;

  @ApiProperty({
    description: 'Filtrar por estado',
    required: false,
    enum: EstadoBus,
  })
  @IsEnum(EstadoBus, { message: 'El estado debe ser un valor válido' })
  @IsOptional()
  estado?: EstadoBus;
}
