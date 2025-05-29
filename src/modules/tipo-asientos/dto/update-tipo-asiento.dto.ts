import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateTipoAsientoDto } from './create-tipo-asiento.dto';

export class UpdateTipoAsientoDto extends PartialType(CreateTipoAsientoDto) {
  @ApiPropertyOptional({
    description: 'Estado activo del tipo de asiento',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser un booleano',
  })
  activo?: boolean;
}
