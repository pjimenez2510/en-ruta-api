import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBoletoDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: 1,
  })
  @IsInt({ message: 'El ID del cliente debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  clienteId: number;

  @ApiProperty({
    description: 'ID del asiento',
    example: 1,
  })
  @IsInt({ message: 'El ID del asiento debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del asiento es requerido' })
  asientoId: number;
}

export class CreateVentaDto {
  @ApiProperty({
    description: 'ID del viaje',
    example: 1,
  })
  @IsInt({ message: 'El ID del viaje debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del viaje es requerido' })
  viajeId: number;

  @ApiProperty({
    description: 'ID de la ciudad de origen',
    example: 1,
  })
  @IsInt({ message: 'El ID de la ciudad de origen debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la ciudad de origen es requerido' })
  ciudadOrigenId: number;

  @ApiProperty({
    description: 'ID de la ciudad de destino',
    example: 2,
  })
  @IsInt({ message: 'El ID de la ciudad de destino debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la ciudad de destino es requerido' })
  ciudadDestinoId: number;

  @ApiProperty({
    description: 'ID del método de pago',
    example: 1,
  })
  @IsInt({ message: 'El ID del método de pago debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del método de pago es requerido' })
  metodoPagoId: number;

  @ApiPropertyOptional({
    description: 'ID del oficinista que procesa la venta (opcional)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID del oficinista debe ser un número entero' })
  oficinistaId?: number;

  @ApiProperty({
    description: 'Lista de boletos a crear en esta venta',
    type: [CreateBoletoDto],
  })
  @IsArray({ message: 'Los boletos deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un boleto' })
  @ValidateNested({ each: true })
  @Type(() => CreateBoletoDto)
  boletos: CreateBoletoDto[];
} 