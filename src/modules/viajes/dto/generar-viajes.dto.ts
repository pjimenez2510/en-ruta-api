import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GenerarViajesDto {
  @ApiProperty({
    description: 'Fecha de inicio para la generación de viajes',
    example: new Date(),
  })
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha de fin para la generación de viajes',
    example: new Date(),
  })
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  fechaFin: Date;

  @ApiPropertyOptional({
    description: 'IDs específicos de rutas a incluir (opcional, si no se especifica se incluyen todas las activas)',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray({ message: 'Los IDs de rutas deben ser un array' })
  @IsInt({ each: true, message: 'Cada ID de ruta debe ser un número entero' })
  rutaIds?: number[];

  @ApiPropertyOptional({
    description: 'IDs específicos de buses a utilizar (opcional, si no se especifica se usan todos los disponibles)',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray({ message: 'Los IDs de buses deben ser un array' })
  @IsInt({ each: true, message: 'Cada ID de bus debe ser un número entero' })
  busIds?: number[];
} 