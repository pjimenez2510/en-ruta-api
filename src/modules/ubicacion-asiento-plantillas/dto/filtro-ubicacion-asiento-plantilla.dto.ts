import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class FiltroUbicacionAsientoPlantillaDto {
  @ApiProperty({
    description: 'Filtrar por ID de plantilla de piso',
    required: false,
  })
  @IsInt({ message: 'El ID de plantilla debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  plantillaPisoId?: number;

  @ApiProperty({
    description: 'Filtrar por número de fila',
    required: false,
  })
  @IsInt({ message: 'La fila debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  fila?: number;

  @ApiProperty({
    description: 'Filtrar por número de columna',
    required: false,
  })
  @IsInt({ message: 'La columna debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  columna?: number;

  @ApiProperty({
    description: 'Filtrar por estado habilitado',
    required: false,
  })
  @IsBoolean({ message: 'El estado habilitado debe ser un valor booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  estaHabilitado?: boolean;
}
