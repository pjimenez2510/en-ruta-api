import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class FiltroHorarioRutaDto {
  @ApiProperty({
    description: 'Filtrar por ID de ruta',
    required: false,
  })
  @IsInt({ message: 'El ID de la ruta debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  rutaId?: number;

  @ApiProperty({
    description: 'Filtrar por hora de salida (formato HH:mm)',
    required: false,
  })
  @IsString({ message: 'La hora de salida debe ser una cadena de caracteres' })
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de salida debe tener el formato HH:mm (24 horas)',
  })
  horaSalida?: string;

  @ApiProperty({
    description: 'Filtrar por día específico de la semana (1=Lunes, 7=Domingo)',
    required: false,
  })
  @IsInt({ message: 'El día de la semana debe ser un número entero entre 1 y 7' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  diaSemana?: number;

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