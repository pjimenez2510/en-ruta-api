import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EstadoAsiento } from '@prisma/client';

export class CreateAsientoItemDto {
  @ApiProperty({
    description: 'Número o identificador del asiento',
    example: '15A',
  })
  @IsString({ message: 'El número de asiento debe ser un texto' })
  @IsNotEmpty({ message: 'El número de asiento es requerido' })
  @MaxLength(10, {
    message: 'El número de asiento no debe exceder los 10 caracteres',
  })
  numero: string;

  @ApiProperty({
    description: 'Número de fila donde se ubica el asiento',
    example: 3,
  })
  @IsInt({ message: 'La fila debe ser un número entero' })
  @IsNotEmpty({ message: 'La fila es requerida' })
  fila: number;

  @ApiProperty({
    description: 'Número de columna donde se ubica el asiento',
    example: 2,
  })
  @IsInt({ message: 'La columna debe ser un número entero' })
  @IsNotEmpty({ message: 'La columna es requerida' })
  columna: number;

  @ApiProperty({
    description: 'ID del tipo de asiento',
    example: 1,
  })
  @IsInt({ message: 'El ID del tipo de asiento debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del tipo de asiento es requerido' })
  tipoId: number;

  @ApiPropertyOptional({
    description: 'Estado del asiento',
    enum: EstadoAsiento,
    default: EstadoAsiento.DISPONIBLE,
  })
  @IsEnum(EstadoAsiento, { message: 'El estado debe ser un valor válido' })
  @IsOptional()
  estado?: EstadoAsiento;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el asiento',
    example: 'Asiento con más espacio para las piernas',
  })
  @IsString({ message: 'Las notas deben ser un texto' })
  @IsOptional()
  @MaxLength(255, { message: 'Las notas no deben exceder los 255 caracteres' })
  notas?: string;
}
