import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsEmail, IsOptional, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class VentaIdParamDto {
  @ApiProperty({
    description: 'ID de la venta',
    example: 123,
  })
  @IsInt({ message: 'El ID de la venta debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  ventaId: number;
}

export class BoletoIdParamDto {
  @ApiProperty({
    description: 'ID del boleto',
    example: 456,
  })
  @IsInt({ message: 'El ID del boleto debe ser un número entero' })
  @Transform(({ value }) => parseInt(value))
  boletoId: number;
}

export class BoletoEstadoParamDto extends BoletoIdParamDto {
  @ApiProperty({
    description: 'Nuevo estado del boleto',
    example: 'CONFIRMADO',
    enum: ['PENDIENTE', 'CONFIRMADO', 'ABORDADO', 'NO_SHOW', 'CANCELADO'],
  })
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  estado: string;
}

export class EmailTestDto {
  @ApiProperty({
    description: 'Email de destino para la prueba',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;
}

export class EstadisticasQueryDto {
  @ApiProperty({
    description: 'Número de días para las estadísticas',
    example: 7,
    required: false,
    minimum: 1,
    maximum: 365,
  })
  @IsOptional()
  @IsInt({ message: 'Los días deben ser un número entero' })
  @Min(1, { message: 'Mínimo 1 día' })
  @Max(365, { message: 'Máximo 365 días' })
  @Transform(({ value }) => value ? parseInt(value) : 7)
  dias?: number = 7;
} 