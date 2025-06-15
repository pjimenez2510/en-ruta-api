import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsDate,
} from 'class-validator';
import { EstadoViaje, TipoGeneracion } from '@prisma/client';

export class FiltroViajeDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de ruta',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la ruta debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  rutaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de horario de ruta',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del horario de ruta debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  horarioRutaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de bus',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del bus debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  busId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de conductor',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del conductor debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  conductorId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de ayudante',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del ayudante debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  ayudanteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha específica',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fecha?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar desde fecha',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaDesde?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar hasta fecha',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del viaje',
    enum: EstadoViaje,
  })
  @IsOptional()
  @IsEnum(EstadoViaje, { message: 'El estado debe ser un valor válido' })
  estado?: EstadoViaje;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de generación',
    enum: TipoGeneracion,
  })
  @IsOptional()
  @IsEnum(TipoGeneracion, { message: 'El tipo de generación debe ser un valor válido' })
  generacion?: TipoGeneracion;
} 