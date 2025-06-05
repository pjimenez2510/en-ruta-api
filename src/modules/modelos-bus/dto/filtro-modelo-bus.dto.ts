import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class FiltroModeloBusDto {
  @ApiProperty({
    description: 'Filtrar por marca',
    required: false,
  })
  @IsString({ message: 'La marca debe ser una cadena de caracteres' })
  @IsOptional()
  marca?: string;

  @ApiProperty({
    description: 'Filtrar por modelo',
    required: false,
  })
  @IsString({ message: 'El modelo debe ser una cadena de caracteres' })
  @IsOptional()
  modelo?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de chasis',
    required: false,
  })
  @IsString({ message: 'El tipo de chasis debe ser una cadena de caracteres' })
  @IsOptional()
  tipoChasis?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de carrocería',
    required: false,
  })
  @IsString({
    message: 'El tipo de carrocería debe ser una cadena de caracteres',
  })
  @IsOptional()
  tipoCarroceria?: string;

  @ApiProperty({
    description: 'Filtrar por año del modelo',
    required: false,
  })
  @IsNumber({}, { message: 'El año del modelo debe ser un número' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  anioModelo?: number;

  @ApiProperty({
    description: 'Filtrar por número de pisos',
    required: false,
  })
  @IsNumber({}, { message: 'El número de pisos debe ser un número' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  numeroPisos?: number;

  @ApiProperty({
    description: 'Filtrar por visibilidad pública',
    required: false,
  })
  @IsBoolean({ message: 'El campo esPublico debe ser un valor booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  esPublico?: boolean;
}
