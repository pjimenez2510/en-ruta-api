import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsInt,
  IsDate,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoBus } from '@prisma/client';

export class CreateBusDto {
  @ApiProperty({
    description: 'ID del modelo de bus',
    example: 1,
  })
  @IsInt({ message: 'El ID del modelo debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del modelo es requerido' })
  modeloBusId: number;

  @ApiProperty({
    description: 'Número del bus (único por tenant)',
    example: 42,
  })
  @IsInt({ message: 'El número debe ser un número entero' })
  @IsNotEmpty({ message: 'El número es requerido' })
  @Min(1, { message: 'El número debe ser mayor a 0' })
  numero: number;

  @ApiProperty({
    description: 'Placa del bus (única por tenant)',
    example: 'ABC-123',
  })
  @IsString({ message: 'La placa debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'La placa es requerida' })
  placa: string;

  @ApiPropertyOptional({
    description: 'Año de fabricación del bus',
    example: 2022,
  })
  @IsOptional()
  @IsInt({ message: 'El año de fabricación debe ser un número entero' })
  anioFabricacion?: number;

  @ApiProperty({
    description: 'Total de asientos del bus',
    example: 45,
  })
  @IsInt({ message: 'El total de asientos debe ser un número entero' })
  @IsNotEmpty({ message: 'El total de asientos es requerido' })
  @Min(1, { message: 'El total de asientos debe ser mayor a 0' })
  totalAsientos: number;

  @ApiPropertyOptional({
    description: 'URL de la foto del bus',
    example: 'https://example.com/foto-bus.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto debe ser una URL válida' })
  fotoUrl?: string;

  @ApiPropertyOptional({
    description: 'Tipo de combustible del bus',
    example: 'Diésel',
  })
  @IsOptional()
  @IsString({
    message: 'El tipo de combustible debe ser una cadena de caracteres',
  })
  tipoCombustible?: string;

  @ApiProperty({
    description: 'Fecha de ingreso del bus',
    example: '2023-01-01',
  })
  @IsDate({ message: 'La fecha de ingreso debe ser una fecha válida' })
  @Type(() => Date)
  fechaIngreso: Date;

  @ApiPropertyOptional({
    description: 'Estado del bus',
    enum: EstadoBus,
    default: EstadoBus.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoBus, {
    message:
      'El estado debe ser un valor válido (ACTIVO, MANTENIMIENTO, RETIRADO)',
  })
  estado?: EstadoBus;
}
