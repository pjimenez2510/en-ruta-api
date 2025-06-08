import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateAsientoDto } from './create-asiento.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoAsiento } from '@prisma/client';

export class UpdateAsientoDto extends PartialType(CreateAsientoDto) {
  @ApiPropertyOptional({
    description: 'Estado del asiento',
    enum: EstadoAsiento,
  })
  @IsEnum(EstadoAsiento, { message: 'El estado debe ser un valor válido' })
  @IsOptional()
  estado?: EstadoAsiento;
}
