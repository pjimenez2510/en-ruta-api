import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FiltroTenantDto {
  @ApiProperty({
    description: 'Filtrar por activo',
    required: false,
  })
  @IsBoolean({ message: 'El activo debe ser un booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  activo?: boolean = true;

  @ApiProperty({
    description: 'Filtrar por color primario',
    required: false,
  })
  @IsString({ message: 'El color primario debe ser una cadena de caracteres' })
  @IsOptional()
  colorPrimario?: string;

  @ApiProperty({
    description: 'Filtrar por color secundario',
    required: false,
  })
  @IsString({
    message: 'El color secundario debe ser una cadena de caracteres',
  })
  @IsOptional()
  colorSecundario?: string;

  @ApiProperty({
    description: 'Filtrar por email de contacto',
    required: false,
  })
  @IsString({
    message: 'El email de contacto debe ser una cadena de caracteres',
  })
  @IsOptional()
  emailContacto?: string;

  @ApiProperty({
    description: 'Filtrar por identificador',
    required: false,
  })
  @IsString({ message: 'El identificador debe ser una cadena de caracteres' })
  @IsOptional()
  identificador?: string;

  @ApiProperty({
    description: 'Filtrar por logo',
    required: false,
  })
  @IsString({ message: 'El logo debe ser una cadena de caracteres' })
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: 'Filtrar por nombre',
    required: false,
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiProperty({
    description: 'Filtrar por sitio web',
    required: false,
  })
  @IsString({ message: 'El sitio web debe ser una cadena de caracteres' })
  @IsOptional()
  sitioWeb?: string;

  @ApiProperty({
    description: 'Filtrar por teléfono',
    required: false,
  })
  @IsString({ message: 'El teléfono debe ser una cadena de caracteres' })
  @IsOptional()
  telefono?: string;
}
