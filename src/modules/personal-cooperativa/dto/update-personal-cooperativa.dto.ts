import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreatePersonalCooperativaDto } from './create-personal-cooperativa.dto';

export class UpdatePersonalCooperativaDto extends PartialType(
  CreatePersonalCooperativaDto,
) {
  @ApiPropertyOptional({
    description: 'Estado activo del personal',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser un booleano',
  })
  activo?: boolean;
}
