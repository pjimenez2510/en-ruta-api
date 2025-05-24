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
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description:
      'Identificador único para la cooperativa (usado en URL y subdominios)',
    example: 'esmeraldas-coop',
  })
  @IsString()
  @IsNotEmpty()
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
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Color primario (código hexadecimal)',
    example: '#1E90FF',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #1E90FF)',
  })
  colorPrimario?: string;

  @ApiPropertyOptional({
    description: 'Color secundario (código hexadecimal)',
    example: '#FFD700',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #FFD700)',
  })
  colorSecundario?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de la cooperativa',
    example: 'https://www.cooperativa-esmeraldas.com',
  })
  @IsOptional()
  @IsUrl()
  sitioWeb?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto de la cooperativa',
    example: 'info@cooperativa-esmeraldas.com',
  })
  @IsOptional()
  @IsEmail()
  emailContacto?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+593987654321',
  })
  @IsOptional()
  @IsString()
  telefono?: string;
}
