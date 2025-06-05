import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateModeloBusDto {
  @ApiProperty({
    description: 'Marca del bus',
    example: 'Mercedes-Benz',
  })
  @IsString({ message: 'La marca debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'La marca es requerida' })
  marca: string;

  @ApiProperty({
    description: 'Modelo del bus',
    example: 'Paradiso 1800 DD',
  })
  @IsString({ message: 'El modelo debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El modelo es requerido' })
  modelo: string;

  @ApiPropertyOptional({
    description: 'Tipo de chasis',
    example: 'O-500 RSD',
  })
  @IsString({ message: 'El tipo de chasis debe ser una cadena de caracteres' })
  @IsOptional()
  tipoChasis?: string;

  @ApiPropertyOptional({
    description: 'Tipo de carrocería',
    example: 'Marcopolo',
  })
  @IsString({
    message: 'El tipo de carrocería debe ser una cadena de caracteres',
  })
  @IsOptional()
  tipoCarroceria?: string;

  @ApiPropertyOptional({
    description: 'Año del modelo',
    example: 2023,
    minimum: 1990,
    maximum: 2100,
  })
  @IsInt({ message: 'El año del modelo debe ser un número entero' })
  @Min(1990, { message: 'El año del modelo debe ser posterior a 1990' })
  @Max(2100, { message: 'El año del modelo debe ser anterior a 2100' })
  @Type(() => Number)
  @IsOptional()
  anioModelo?: number;

  @ApiProperty({
    description: 'Número de pisos',
    example: 2,
    minimum: 1,
    maximum: 2,
    default: 1,
  })
  @IsInt({ message: 'El número de pisos debe ser un número entero' })
  @Min(1, { message: 'El número de pisos debe ser al menos 1' })
  @Max(2, { message: 'El número de pisos no puede ser mayor a 2' })
  @Type(() => Number)
  @IsOptional()
  numeroPisos?: number = 1;

  @ApiPropertyOptional({
    description: 'Descripción del modelo de bus',
    example: 'Bus de lujo con capacidad para 50 pasajeros',
  })
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    description:
      'Indica si el modelo es público y puede ser usado por todos los tenants',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'El campo esPublico debe ser un valor booleano' })
  @IsOptional()
  esPublico?: boolean = true;
}
