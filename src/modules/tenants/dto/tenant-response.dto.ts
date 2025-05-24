import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tenant } from '@prisma/client';

export class TenantResponseDto {
  @ApiProperty({
    description: 'Identificador único del tenant',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la cooperativa de transporte',
    example: 'Cooperativa Esmeraldas',
  })
  nombre: string;

  @ApiProperty({
    description:
      'Identificador único para la cooperativa (usado en URL y subdominios)',
    example: 'esmeraldas-coop',
  })
  identificador: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la cooperativa',
    example: 'https://example.com/logo.png',
  })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Color primario (código hexadecimal)',
    example: '#1E90FF',
  })
  colorPrimario?: string;

  @ApiPropertyOptional({
    description: 'Color secundario (código hexadecimal)',
    example: '#FFD700',
  })
  colorSecundario?: string;

  @ApiPropertyOptional({
    description: 'Sitio web de la cooperativa',
    example: 'https://www.cooperativa-esmeraldas.com',
  })
  sitioWeb?: string;

  @ApiPropertyOptional({
    description: 'Email de contacto de la cooperativa',
    example: 'info@cooperativa-esmeraldas.com',
  })
  emailContacto?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+593987654321',
  })
  telefono?: string;

  @ApiProperty({
    description: 'Fecha de registro',
    example: '2023-01-01T00:00:00Z',
  })
  fechaRegistro: Date;

  @ApiProperty({
    description: 'Estado activo del tenant',
    example: true,
  })
  activo: boolean;

  constructor(tenant: Tenant) {
    this.id = tenant.id;
    this.nombre = tenant.nombre;
    this.identificador = tenant.identificador;
    this.logoUrl = tenant.logoUrl;
    this.colorPrimario = tenant.colorPrimario;
    this.colorSecundario = tenant.colorSecundario;
    this.sitioWeb = tenant.sitioWeb;
    this.emailContacto = tenant.emailContacto;
    this.telefono = tenant.telefono;
    this.fechaRegistro = tenant.fechaRegistro;
    this.activo = tenant.activo;
  }

  static fromEntity(tenant: Tenant): TenantResponseDto {
    return new TenantResponseDto(tenant);
  }

  static fromEntities(tenants: Tenant[]): TenantResponseDto[] {
    return tenants.map((tenant) => new TenantResponseDto(tenant));
  }
}
