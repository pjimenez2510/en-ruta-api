import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsEnum,
  IsDate,
} from 'class-validator';
import { TipoDocumento } from '@prisma/client';

export class FiltroClienteDto {
  @ApiProperty({
    description: 'Filtrar por nombres',
    required: false,
  })
  @IsString({ message: 'Los nombres deben ser una cadena de caracteres' })
  @IsOptional()
  nombres?: string;

  @ApiProperty({
    description: 'Filtrar por apellidos',
    required: false,
  })
  @IsString({ message: 'Los apellidos deben ser una cadena de caracteres' })
  @IsOptional()
  apellidos?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de documento',
    enum: TipoDocumento,
    required: false,
  })
  @IsEnum(TipoDocumento, { message: 'Tipo de documento no válido' })
  @IsOptional()
  tipoDocumento?: TipoDocumento;

  @ApiProperty({
    description: 'Filtrar por número de documento',
    required: false,
  })
  @IsString({
    message: 'El número de documento debe ser una cadena de caracteres',
  })
  @IsOptional()
  numeroDocumento?: string;

  @ApiProperty({
    description: 'Filtrar por teléfono',
    required: false,
  })
  @IsString({ message: 'El teléfono debe ser una cadena de caracteres' })
  @IsOptional()
  telefono?: string;

  @ApiProperty({
    description: 'Filtrar por email',
    required: false,
  })
  @IsString({ message: 'El email debe ser una cadena de caracteres' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Filtrar por estado de discapacidad',
    required: false,
  })
  @IsBoolean({ message: 'El estado de discapacidad debe ser un booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  esDiscapacitado?: boolean;

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
}
