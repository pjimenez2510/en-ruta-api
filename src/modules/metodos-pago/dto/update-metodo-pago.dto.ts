import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateMetodoPagoDto } from './create-metodo-pago.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMetodoPagoDto extends PartialType(CreateMetodoPagoDto) {
  @ApiPropertyOptional({
    description: 'Estado del método de pago',
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 