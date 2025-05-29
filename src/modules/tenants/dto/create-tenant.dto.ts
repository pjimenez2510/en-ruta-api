import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEmail,
  Matches,
} from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nombre de la cooperativa de transporte',
    example: 'Cooperativa Esmeraldas',
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description:
      'Identificador único para la cooperativa (usado en URL y subdominios)',
    example: 'esmeraldas-coop',
  })
  @IsString({ message: 'El identificador debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'El identificador es requerido' })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'El identificador solo puede contener letras minúsculas, números y guiones',
  })
  identificador: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la cooperativa',
    example: 'https://example.com/logo.png',
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del logo debe ser una URL válida' })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Color primario (código hexadecimal)',
    example: '#1E90FF',
  })
  @IsOptional()
  @IsString({ message: 'El color debe ser una cadena de caracteres' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #1E90FF)',
  })
  colorPrimario?: string;

  @ApiPropertyOptional({
    description: 'Color secundario (código hexadecimal)',
    example: '#FFD700',
  })
  @IsOptional()
  @IsString({ message: 'El color debe ser una cadena de caracteres' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #FFD700)',
  })
  colorSecundario?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de la cooperativa',
    example: 'https://www.cooperativa-esmeraldas.com',
  })
  @IsOptional()
  @IsUrl({}, { message: 'El sitio web debe ser una URL válida' })
  sitioWeb?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto de la cooperativa',
    example: 'info@cooperativa-esmeraldas.com',
  })
  @IsOptional()
  @IsEmail(
    {},
    { message: 'El email de contacto debe ser una dirección de correo válida' },
  )
  emailContacto?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+593987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de caracteres' })
  telefono?: string;
}
