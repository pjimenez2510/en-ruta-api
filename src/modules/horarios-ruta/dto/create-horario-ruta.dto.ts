import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  Matches,
} from 'class-validator';

export class CreateHorarioRutaDto {
  @ApiProperty({
    description: 'ID de la ruta a la que pertenece el horario',
    example: 1,
  })
  @IsInt({ message: 'El ID de la ruta debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la ruta es requerido' })
  rutaId: number;

  @ApiProperty({
    description: 'Hora de salida del horario (formato HH:mm)',
    example: '06:30',
  })
  @IsString({ message: 'La hora de salida debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'La hora de salida es requerida' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora de salida debe tener el formato HH:mm (24 horas)',
  })
  horaSalida: string;

  @ApiProperty({
    description: 'Días de la semana en formato binario (1=activo, 0=inactivo). Lunes a Domingo.',
    example: '1111100',
    pattern: '^[01]{7}$',
  })
  @IsString({ message: 'Los días de semana deben ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'Los días de semana son requeridos' })
  @Matches(/^[01]{7}$/, {
    message: 'Los días de semana deben ser exactamente 7 dígitos binarios (0 o 1)',
  })
  diasSemana: string;

  @ApiPropertyOptional({
    description: 'Estado del horario',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 