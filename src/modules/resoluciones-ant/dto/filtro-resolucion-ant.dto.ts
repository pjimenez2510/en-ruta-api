import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FiltroResolucionAntDto {
  @ApiProperty({
    description: 'Filtrar por número de resolución',
    required: false,
  })
  @IsString({ message: 'El número de resolución debe ser una cadena de caracteres' })
  @IsOptional()
  numeroResolucion?: string;

  @ApiProperty({
    description: 'Filtrar por fecha de emisión desde',
    required: false,
  })
  @IsDate({ message: 'La fecha de emisión desde debe ser una fecha válida' })
  @IsOptional()
  @Type(() => Date)
  fechaEmisionDesde?: Date;

  @ApiProperty({
    description: 'Filtrar por fecha de emisión hasta',
    required: false,
  })
  @IsDate({ message: 'La fecha de emisión hasta debe ser una fecha válida' })
  @IsOptional()
  @Type(() => Date)
  fechaEmisionHasta?: Date;

  @ApiProperty({
    description: 'Filtrar por fecha de vigencia desde',
    required: false,
  })
  @IsDate({ message: 'La fecha de vigencia desde debe ser una fecha válida' })
  @IsOptional()
  @Type(() => Date)
  fechaVigenciaDesde?: Date;

  @ApiProperty({
    description: 'Filtrar por fecha de vigencia hasta',
    required: false,
  })
  @IsDate({ message: 'La fecha de vigencia hasta debe ser una fecha válida' })
  @IsOptional()
  @Type(() => Date)
  fechaVigenciaHasta?: Date;

  @ApiProperty({
    description: 'Filtrar por descripción',
    required: false,
  })
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
  })
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  activo?: boolean;
} 