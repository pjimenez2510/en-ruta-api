import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreatePlantillaPisoDto {
  @ApiProperty({
    description: 'ID del modelo de bus al que pertenece la plantilla',
    example: 1,
  })
  @IsInt({ message: 'El ID del modelo de bus debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del modelo de bus es requerido' })
  modeloBusId: number;

  @ApiProperty({
    description: 'Número de piso',
    example: 1,
  })
  @IsInt({ message: 'El número de piso debe ser un número entero' })
  @IsNotEmpty({ message: 'El número de piso es requerido' })
  @Min(1, { message: 'El número de piso debe ser al menos 1' })
  numeroPiso: number;

  @ApiProperty({
    description: 'Cantidad de filas en el piso',
    example: 8,
  })
  @IsInt({ message: 'La cantidad de filas debe ser un número entero' })
  @IsNotEmpty({ message: 'La cantidad de filas es requerida' })
  @Min(1, { message: 'La cantidad de filas debe ser al menos 1' })
  filas: number;

  @ApiProperty({
    description: 'Cantidad de columnas en el piso',
    example: 5,
  })
  @IsInt({ message: 'La cantidad de columnas debe ser un número entero' })
  @IsNotEmpty({ message: 'La cantidad de columnas es requerida' })
  @Min(1, { message: 'La cantidad de columnas debe ser al menos 1' })
  columnas: number;

  @ApiPropertyOptional({
    description: 'Descripción de la plantilla del piso',
    example: 'Configuración estándar para buses de 2 pisos',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MaxLength(200, {
    message: 'La descripción no puede exceder los 200 caracteres',
  })
  descripcion?: string;

  @ApiPropertyOptional({
    description:
      'Indica si la plantilla es pública para todas las cooperativas',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo esPublico debe ser un valor booleano' })
  esPublico?: boolean;
}
