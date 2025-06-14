import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateRutaDto } from './create-ruta.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateRutaDto extends PartialType(CreateRutaDto) {
  @ApiPropertyOptional({
    description: 'Estado de la ruta',
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 