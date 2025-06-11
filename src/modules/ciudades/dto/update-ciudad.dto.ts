import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateCiudadDto } from './create-ciudad.dto';

export class UpdateCiudadDto extends PartialType(CreateCiudadDto) {
  @ApiPropertyOptional({
    description: 'Estado activo de la ciudad',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser un booleano',
  })
  activo?: boolean;
}
