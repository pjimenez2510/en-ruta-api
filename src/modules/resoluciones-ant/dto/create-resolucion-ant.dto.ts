import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateResolucionAntDto {
  @ApiProperty({
    description: 'Número de la resolución ANT',
    example: 'ANT-2023-001',
  })
  @IsString({ message: 'El número de resolución debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El número de resolución es requerido' })
  numeroResolucion: string;

  @ApiProperty({
    description: 'Fecha de emisión de la resolución',
    example: '2023-01-15T10:00:00.000Z',
  })
  @IsDate({ message: 'La fecha de emisión debe ser una fecha válida' })
  @Type(() => Date)
  fechaEmision: Date;

  @ApiPropertyOptional({
    description: 'Fecha de vigencia de la resolución',
    example: '2024-01-15T10:00:00.000Z',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de vigencia debe ser una fecha válida' })
  @Type(() => Date)
  fechaVigencia?: Date;

  @ApiPropertyOptional({
    description: 'URL del documento de la resolución',
    example: 'https://example.com/resolucion-ant-001.pdf',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del documento debe ser una URL válida' })
  documentoUrl?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la resolución',
    example: 'Resolución para ruta Quito-Guayaquil',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Estado de la resolución',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  activo?: boolean;
} 