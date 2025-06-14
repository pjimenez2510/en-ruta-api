import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDecimal,
  Min,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateParadaRutaDto {
  @ApiProperty({
    description: 'ID de la ruta',
    example: 1,
  })
  @IsInt({ message: 'El ID de la ruta debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la ruta es requerido' })
  rutaId: number;

  @ApiProperty({
    description: 'ID de la ciudad',
    example: 1,
  })
  @IsInt({ message: 'El ID de la ciudad debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la ciudad es requerido' })
  ciudadId: number;

  @ApiProperty({
    description: 'Orden de la parada en la ruta (0 = origen, último = destino)',
    example: 0,
  })
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden debe ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'El orden es requerido' })
  orden: number;

  @ApiPropertyOptional({
    description: 'Distancia acumulada desde el origen en kilómetros',
    example: 50.5,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'La distancia debe ser un número válido' })
  @Transform(({ value }) => value ? parseFloat(value) : null)
  distanciaAcumulada?: number;

  @ApiProperty({
    description: 'Tiempo acumulado desde el origen en minutos',
    example: 120,
  })
  @IsInt({ message: 'El tiempo acumulado debe ser un número entero' })
  @Min(0, { message: 'El tiempo acumulado debe ser mayor o igual a 0' })
  @IsNotEmpty({ message: 'El tiempo acumulado es requerido' })
  tiempoAcumulado: number;

  @ApiProperty({
    description: 'Precio acumulado desde el origen',
    example: 15.50,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número válido' })
  @Transform(({ value }) => parseFloat(value))
  @IsNotEmpty({ message: 'El precio acumulado es requerido' })
  precioAcumulado: number;
} 