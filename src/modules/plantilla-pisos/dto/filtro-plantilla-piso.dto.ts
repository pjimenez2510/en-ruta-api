import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class FiltroPlantillaPisoDto {
  @ApiProperty({
    description: 'Filtrar por ID de modelo de bus',
    required: false,
  })
  @IsInt({ message: 'El ID del modelo de bus debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  modeloBusId?: number;

  @ApiProperty({
    description: 'Filtrar por número de piso',
    required: false,
  })
  @IsInt({ message: 'El número de piso debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  numeroPiso?: number;

  @ApiProperty({
    description: 'Filtrar por texto en la descripción',
    required: false,
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Filtrar por estado público',
    required: false,
  })
  @IsBoolean({ message: 'El estado público debe ser un valor booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  esPublico?: boolean;
}
