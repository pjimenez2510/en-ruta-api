import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';

export class TenantRegistroDto {
  @ApiProperty({
    description: 'Nombre de la cooperativa de transporte',
    example: 'Cooperativa Esmeraldas',
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description:
      'Identificador único para la cooperativa (usado en URL y subdominios)',
    example: 'esmeraldas-coop',
  })
  @IsString({ message: 'El identificador debe ser un texto' })
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
  @IsString({ message: 'La URL del logo debe ser un texto' })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Color primario (código hexadecimal)',
    example: '#1E90FF',
  })
  @IsOptional()
  @IsString({ message: 'El color primario debe ser un texto' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #1E90FF)',
  })
  colorPrimario?: string;

  @ApiPropertyOptional({
    description: 'Color secundario (código hexadecimal)',
    example: '#FFD700',
  })
  @IsOptional()
  @IsString({ message: 'El color secundario debe ser un texto' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe ser un código hexadecimal válido (ej: #FFD700)',
  })
  colorSecundario?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de la cooperativa',
    example: 'https://www.cooperativa-esmeraldas.com',
  })
  @IsOptional()
  @IsString({ message: 'El sitio web debe ser un texto' })
  sitioWeb?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto de la cooperativa',
    example: 'info@cooperativa-esmeraldas.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email de contacto debe ser un formato válido' })
  emailContacto?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+593987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  telefono?: string;
}

export class RegistroCooperativaDto {
  @ApiProperty({
    description: 'Email para la cuenta de administrador',
    example: 'admin@cooperativa-esmeraldas.com',
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
    description: 'Datos de la cooperativa (tenant)',
    type: TenantRegistroDto,
  })
  @IsNotEmpty({ message: 'Los datos de la cooperativa son requeridos' })
  @ValidateNested({ each: true })
  @Type(() => TenantRegistroDto)
  tenant: TenantRegistroDto;
}
