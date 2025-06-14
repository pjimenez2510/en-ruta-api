import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateResolucionAntDto } from './create-resolucion-ant.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateResolucionAntDto extends PartialType(CreateResolucionAntDto) {
  @ApiPropertyOptional({
    description: 'Estado de la resolución',
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  activo?: boolean;
} 