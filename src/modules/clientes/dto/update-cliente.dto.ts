import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateClienteDto } from './create-cliente.dto';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  @ApiPropertyOptional({
    description: 'Estado activo del cliente',
    example: true,
  })
  @IsOptional()
  @IsBoolean({
    message: 'El estado activo debe ser un booleano',
  })
  activo?: boolean;
}
