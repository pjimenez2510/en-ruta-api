import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateBusDto } from './create-bus.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoBus } from '@prisma/client';

export class UpdateBusDto extends PartialType(CreateBusDto) {
  @ApiPropertyOptional({
    description: 'Estado del bus',
    enum: EstadoBus,
  })
  @IsOptional()
  @IsEnum(EstadoBus, {
    message:
      'El estado debe ser un valor válido (ACTIVO, MANTENIMIENTO, RETIRADO)',
  })
  estado?: EstadoBus;
}
