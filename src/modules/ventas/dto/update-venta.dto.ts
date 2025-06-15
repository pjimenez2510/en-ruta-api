import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoPago, EstadoBoleto } from '@prisma/client';

export class UpdateVentaDto {
  @ApiPropertyOptional({
    description: 'Estado de pago de la venta',
    enum: EstadoPago,
  })
  @IsOptional()
  @IsEnum(EstadoPago, { message: 'El estado de pago debe ser un valor válido' })
  estadoPago?: EstadoPago;
}

export class UpdateBoletoDto {
  @ApiPropertyOptional({
    description: 'Estado del boleto',
    enum: EstadoBoleto,
  })
  @IsOptional()
  @IsEnum(EstadoBoleto, { message: 'El estado del boleto debe ser un valor válido' })
  estado?: EstadoBoleto;
} 