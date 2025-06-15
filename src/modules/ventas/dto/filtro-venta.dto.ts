import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDate,
  IsString,
} from 'class-validator';
import { EstadoPago } from '@prisma/client';

export class FiltroVentaDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de viaje',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del viaje debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  viajeId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario comprador',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  usuarioId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de oficinista',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del oficinista debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  oficinistaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de método de pago',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del método de pago debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  metodoPagoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de pago',
    enum: EstadoPago,
  })
  @IsOptional()
  @IsEnum(EstadoPago, { message: 'El estado de pago debe ser un valor válido' })
  estadoPago?: EstadoPago;

  @ApiPropertyOptional({
    description: 'Filtrar desde fecha de venta',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaVentaDesde?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar hasta fecha de venta',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaVentaHasta?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha específica',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaVenta?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de ruta',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la ruta debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  rutaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre de ruta',
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la ruta debe ser una cadena de caracteres' })
  nombreRuta?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de viaje',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaViaje?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar desde fecha de viaje',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaViajeDesde?: Date;

  @ApiPropertyOptional({
    description: 'Filtrar hasta fecha de viaje',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaViajeHasta?: Date;
} 