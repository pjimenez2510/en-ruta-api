import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateHorarioRutaDto } from './create-horario-ruta.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateHorarioRutaDto extends PartialType(CreateHorarioRutaDto) {
  @ApiPropertyOptional({
    description: 'Estado del horario',
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 