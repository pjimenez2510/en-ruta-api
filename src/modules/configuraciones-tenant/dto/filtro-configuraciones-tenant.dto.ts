import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoConfiguracion } from '@prisma/client';

export class FiltroConfiguracionesTenantDto {
  @ApiProperty({
    description: 'Filtrar por clave',
    required: false,
  })
  @IsString({ message: 'La clave debe ser una cadena de caracteres' })
  @IsOptional()
  clave?: string;

  @ApiProperty({
    description: 'Filtrar por valor',
    required: false,
  })
  @IsString({ message: 'El valor debe ser una cadena de caracteres' })
  @IsOptional()
  valor?: string;

  @ApiProperty({
    description: 'Filtrar por tipo',
    enum: TipoConfiguracion,
    required: false,
  })
  @IsEnum(TipoConfiguracion, { message: 'El tipo debe ser un valor válido' })
  @IsOptional()
  tipo?: TipoConfiguracion;

  @ApiProperty({
    description: 'Filtrar por ID de tenant',
    required: false,
  })
  @IsNumber({}, { message: 'El ID del tenant debe ser un número' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  tenantId?: number;

  @ApiProperty({
    description: 'Filtrar por texto en la descripción',
    required: false,
  })
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  @IsOptional()
  descripcion?: string;
}
