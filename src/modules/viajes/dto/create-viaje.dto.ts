import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsDate,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoViaje, TipoGeneracion } from '@prisma/client';

export class CreateViajeDto {
  @ApiProperty({
    description: 'ID del horario de ruta',
    example: 1,
  })
  @IsInt({ message: 'El ID del horario de ruta debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del horario de ruta es requerido' })
  horarioRutaId: number;

  @ApiProperty({
    description: 'ID del bus asignado al viaje',
    example: 1,
  })
  @IsInt({ message: 'El ID del bus debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del bus es requerido' })
  busId: number;

  @ApiPropertyOptional({
    description: 'ID del conductor asignado al viaje',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del conductor debe ser un número entero' })
  conductorId?: number;

  @ApiPropertyOptional({
    description: 'ID del ayudante asignado al viaje',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del ayudante debe ser un número entero' })
  ayudanteId?: number;

  @ApiProperty({
    description: 'Fecha del viaje',
    example: new Date(),
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha del viaje es requerida' })
  fecha: Date;

  @ApiPropertyOptional({
    description: 'Estado del viaje',
    enum: EstadoViaje,
    default: EstadoViaje.PROGRAMADO,
  })
  @IsOptional()
  @IsEnum(EstadoViaje, { message: 'El estado debe ser un valor válido' })
  estado?: EstadoViaje;

  @ApiPropertyOptional({
    description: 'Observaciones del viaje',
    example: 'Viaje regular matutino',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de caracteres' })
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Tipo de generación del viaje',
    enum: TipoGeneracion,
    default: TipoGeneracion.MANUAL,
  })
  @IsOptional()
  @IsEnum(TipoGeneracion, { message: 'El tipo de generación debe ser un valor válido' })
  generacion?: TipoGeneracion;
} 