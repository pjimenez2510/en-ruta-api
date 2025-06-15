import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsNumber } from 'class-validator';
import { FiltroViajeDto } from './filtro-viaje.dto';
import { Type } from 'class-transformer';

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
}
