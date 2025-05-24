import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  ValidateNested,
} from 'class-validator';

export class ClienteDto {
  @ApiProperty({
    description: 'Nombres del cliente',
    example: 'Juan Antonio',
  })
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del cliente',
    example: 'Pérez González',
  })
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumento,
    example: TipoDocumento.CEDULA,
  })
  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;

  @ApiProperty({
    description: 'Número de documento',
    example: '1712345678',
  })
  @IsString()
  @IsNotEmpty()
  numeroDocumento: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+593987654321',
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto',
    example: 'cliente@ejemplo.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento (YYYY-MM-DD)',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Indica si el cliente tiene alguna discapacidad',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  esDiscapacitado?: boolean;

  @ApiPropertyOptional({
    description: 'Porcentaje de discapacidad (si aplica)',
    example: 30.5,
  })
  @IsOptional()
  @IsNumber()
  porcentajeDiscapacidad?: number;
}

export class RegistroClienteDto {
  @ApiProperty({
    description: 'Email para la cuenta de usuario',
    example: 'cliente@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe ser un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña para la cuenta',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Datos del cliente',
    type: ClienteDto,
  })
  @IsNotEmpty({ message: 'Los datos del cliente son requeridos' })
  @ValidateNested({ each: true })
  @Type(() => ClienteDto)
  cliente: ClienteDto;
}
