import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateViajeDto } from './create-viaje.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoViaje } from '@prisma/client';

export class UpdateViajeDto extends PartialType(CreateViajeDto) {
  @ApiPropertyOptional({
    description: 'Estado del viaje',
    enum: EstadoViaje,
  })
  @IsOptional()
  @IsEnum(EstadoViaje, { message: 'El estado debe ser un valor válido' })
  estado?: EstadoViaje;
} 