import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDate,
  IsString,
} from 'class-validator';
import { EstadoBoleto, TipoDescuentoCliente } from '@prisma/client';

export class FiltroBoletoDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de venta',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la venta debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  ventaId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de viaje',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del viaje debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  viajeId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  clienteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de asiento',
  })
  @IsOptional()
  @IsInt({ message: 'El ID del asiento debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  asientoId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del boleto',
    enum: EstadoBoleto,
  })
  @IsOptional()
  @IsEnum(EstadoBoleto, { message: 'El estado del boleto debe ser un valor válido' })
  estado?: EstadoBoleto;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de descuento',
    enum: TipoDescuentoCliente,
  })
  @IsOptional()
  @IsEnum(TipoDescuentoCliente, { message: 'El tipo de descuento debe ser un valor válido' })
  tipoDescuento?: TipoDescuentoCliente;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de viaje específica',
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

  @ApiPropertyOptional({
    description: 'Filtrar por código de acceso',
  })
  @IsOptional()
  @IsString({ message: 'El código de acceso debe ser una cadena de caracteres' })
  codigoAcceso?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por documento del cliente',
  })
  @IsOptional()
  @IsString({ message: 'El documento del cliente debe ser una cadena de caracteres' })
  documentoCliente?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nombre del cliente',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser una cadena de caracteres' })
  nombreCliente?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de ciudad de origen',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la ciudad de origen debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  ciudadOrigenId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de ciudad de destino',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de la ciudad de destino debe ser un número entero' })
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  ciudadDestinoId?: number;
} 