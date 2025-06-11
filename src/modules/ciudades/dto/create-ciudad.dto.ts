import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDecimal,
  Max,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateCiudadDto {
  @ApiProperty({
    description: 'Nombre de la ciudad',
    example: 'Quito',
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Provincia donde se encuentra la ciudad',
    example: 'Pichincha',
  })
  @IsString({ message: 'La provincia debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'La provincia es requerida' })
  provincia: string;

  @ApiPropertyOptional({
    description: 'Latitud geográfica de la ciudad (grados decimales)',
    example: -0.225219,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud mínima es -90' })
  @Max(90, { message: 'La latitud máxima es 90' })
  latitud?: number;

  @ApiPropertyOptional({
    description: 'Longitud geográfica de la ciudad (grados decimales)',
    example: -78.5248,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud mínima es -180' })
  @Max(180, { message: 'La longitud máxima es 180' })
  longitud?: number;
}
