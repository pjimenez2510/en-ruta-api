import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsNumber, IsString } from 'class-validator';
import { FiltroViajeDto } from './filtro-viaje.dto';
import { Transform, Type } from 'class-transformer';

export class FiltroViajePublicoDto extends FiltroViajeDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de ciudad de origen',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'El ID de la ciudad de origen debe ser un número entero' },
  )
  ciudadOrigenId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de ciudad de destino',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: 'El ID de la ciudad de destino debe ser un número entero' },
  )
  ciudadDestinoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de cooperativa',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID de la cooperativa debe ser un número entero' })
  cooperativaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por marca',
    required: false,
  })
  @IsString({ message: 'La marca debe ser una cadena de caracteres' })
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por modelo',
    required: false,
  })
  @IsString({ message: 'El modelo debe ser una cadena de caracteres' })
  @IsOptional()
  modelo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de chasis',
    required: false,
  })
  @IsString({ message: 'El tipo de chasis debe ser una cadena de caracteres' })
  @IsOptional()
  tipoChasis?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de carrocería',
    required: false,
  })
  @IsString({
    message: 'El tipo de carrocería debe ser una cadena de caracteres',
  })
  @IsOptional()
  tipoCarroceria?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por año del modelo',
    required: false,
  })
  @IsNumber({}, { message: 'El año del modelo debe ser un número' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  anioModelo?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por número de pisos',
    required: false,
  })
  @IsNumber({}, { message: 'El número de pisos debe ser un número' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  numeroPisos?: number;
}
