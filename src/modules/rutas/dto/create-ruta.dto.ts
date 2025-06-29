import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateRutaDto {
  @ApiProperty({
    description: 'Nombre de la ruta',
    example: 'Quito - Guayaquil',
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'ID del tipo de ruta de bus',
    example: 1,
  })
  @IsInt({ message: 'El ID del tipo de ruta de bus debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del tipo de ruta de bus es requerido' })
  tipoRutaBusId: number;

  @ApiProperty({
    description: 'ID de la resolución ANT',
    example: 1,
  })
  @IsInt({ message: 'El ID de la resolución debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la resolución es requerido' })
  resolucionId: number;

  @ApiPropertyOptional({
    description: 'Descripción de la ruta',
    example: 'Ruta principal desde Quito a Guayaquil con paradas intermedias',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Estado de la ruta',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 