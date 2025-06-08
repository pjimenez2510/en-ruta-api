import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateUbicacionAsientoPlantillaDto {
  @ApiProperty({
    description: 'ID de la plantilla de piso a la que pertenece la ubicación',
    example: 1,
  })
  @IsInt({ message: 'El ID de la plantilla debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la plantilla es requerido' })
  plantillaPisoId: number;

  @ApiProperty({
    description: 'Número de fila de la ubicación',
    example: 1,
  })
  @IsInt({ message: 'La fila debe ser un número entero' })
  @IsNotEmpty({ message: 'La fila es requerida' })
  @Min(0, { message: 'La fila debe ser un número positivo' })
  fila: number;

  @ApiProperty({
    description: 'Número de columna de la ubicación',
    example: 2,
  })
  @IsInt({ message: 'La columna debe ser un número entero' })
  @IsNotEmpty({ message: 'La columna es requerida' })
  @Min(0, { message: 'La columna debe ser un número positivo' })
  columna: number;

  @ApiPropertyOptional({
    description: 'Indica si la ubicación está habilitada',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo estaHabilitado debe ser un valor booleano' })
  estaHabilitado?: boolean;
}
