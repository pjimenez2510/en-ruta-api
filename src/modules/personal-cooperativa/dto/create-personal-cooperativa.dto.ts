import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsUrl,
  IsDate,
} from 'class-validator';
import { TipoDocumento } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePersonalCooperativaDto {
  @ApiProperty({
    description: 'Nombres del personal',
    example: 'Juan Carlos',
  })
  @IsString({ message: 'Los nombres deben ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del personal',
    example: 'Pérez Gómez',
  })
  @IsString({ message: 'Los apellidos deben ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  apellidos: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumento,
    example: TipoDocumento.CEDULA,
    default: TipoDocumento.CEDULA,
  })
  @IsEnum(TipoDocumento, { message: 'El tipo de documento no es válido' })
  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  tipoDocumento: TipoDocumento;

  @ApiProperty({
    description: 'Número de documento',
    example: '1234567890',
  })
  @IsString({
    message: 'El número de documento debe ser una cadena de caracteres',
  })
  @IsNotEmpty({ message: 'El número de documento es requerido' })
  numeroDocumento: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+593987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de caracteres' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email del personal',
    example: 'juan.perez@ejemplo.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser una dirección de correo válida' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '1985-05-15',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  @Type(() => Date)
  fechaNacimiento?: Date;

  @ApiPropertyOptional({
    description: 'Dirección de residencia',
    example: 'Av. Principal 123',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de caracteres' })
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Ciudad de residencia',
    example: 'Quito',
  })
  @IsOptional()
  @IsString({ message: 'La ciudad debe ser una cadena de caracteres' })
  ciudadResidencia?: string;

  @ApiPropertyOptional({
    description: 'Género',
    example: 'Masculino',
  })
  @IsOptional()
  @IsString({ message: 'El género debe ser una cadena de caracteres' })
  genero?: string;

  @ApiPropertyOptional({
    description: 'URL de la foto de perfil',
    example: 'https://ejemplo.com/fotos/juan.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de la foto debe ser válida' })
  fotoPerfil?: string;

  @ApiPropertyOptional({
    description: 'Fecha de contratación',
    example: '2022-01-10',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de contratación debe ser una fecha válida' })
  @Type(() => Date)
  fechaContratacion?: Date;

  @ApiPropertyOptional({
    description: 'Número de licencia de conducir (requerido para conductores)',
    example: 'L12345678',
  })
  @IsString({
    message: 'El número de licencia debe ser una cadena de caracteres',
  })
  @IsOptional()
  licenciaConducir?: string;

  @ApiPropertyOptional({
    description: 'Tipo de licencia (requerido para conductores)',
    example: 'Tipo E',
  })
  @IsString({
    message: 'El tipo de licencia debe ser una cadena de caracteres',
  })
  @IsOptional()
  tipoLicencia?: string;

  @ApiPropertyOptional({
    description:
      'Fecha de expiración de la licencia (requerido para conductores)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de expiración debe ser una fecha válida' })
  @Type(() => Date)
  fechaExpiracionLicencia?: Date;
}
