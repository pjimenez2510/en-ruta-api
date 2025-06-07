import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
} from 'class-validator';
import { TipoDocumento, RolUsuario } from '@prisma/client';

export class FiltroPersonalCooperativaDto {
  @ApiProperty({
    description: 'Filtrar por nombres',
    required: false,
  })
  @IsString({ message: 'Los nombres deben ser una cadena de caracteres' })
  @IsOptional()
  nombres?: string;

  @ApiProperty({
    description: 'Filtrar por apellidos',
    required: false,
  })
  @IsString({ message: 'Los apellidos deben ser una cadena de caracteres' })
  @IsOptional()
  apellidos?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de documento',
    enum: TipoDocumento,
    required: false,
  })
  @IsEnum(TipoDocumento, { message: 'El tipo de documento no es válido' })
  @IsOptional()
  tipoDocumento?: TipoDocumento;

  @ApiProperty({
    description: 'Filtrar por número de documento',
    required: false,
  })
  @IsString({
    message: 'El número de documento debe ser una cadena de caracteres',
  })
  @IsOptional()
  numeroDocumento?: string;

  @ApiProperty({
    description: 'Filtrar por email',
    required: false,
  })
  @IsString({ message: 'El email debe ser una cadena de caracteres' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Filtrar por ciudad de residencia',
    required: false,
  })
  @IsString({ message: 'La ciudad debe ser una cadena de caracteres' })
  @IsOptional()
  ciudadResidencia?: string;

  @ApiProperty({
    description: 'Filtrar por ID de usuario-tenant',
    required: false,
  })
  @IsInt({ message: 'El ID de usuario-tenant debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  usuarioTenantId?: number;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  activo?: boolean = true;
}
