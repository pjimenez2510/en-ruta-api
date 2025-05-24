import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';

export class TenantInfo {
  @ApiProperty({
    description: 'ID del tenant',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del tenant',
    example: 'Cooperativa Esmeraldas',
  })
  nombre: string;

  @ApiProperty({
    description: 'Identificador único del tenant',
    example: 'esmeraldas',
  })
  identificador: string;

  @ApiProperty({
    description: 'URL del logo del tenant',
    example: 'https://ejemplo.com/logo.png',
    nullable: true,
  })
  logoUrl: string | null;

  @ApiProperty({
    description: 'Color primario del tenant (en hexadecimal)',
    example: '#1E90FF',
    nullable: true,
  })
  colorPrimario: string | null;

  @ApiProperty({
    description: 'Color secundario del tenant (en hexadecimal)',
    example: '#FFD700',
    nullable: true,
  })
  colorSecundario: string | null;
}

export class TenantUsuarioDto {
  @ApiProperty({
    description: 'ID del registro de asociación usuario-tenant',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  usuarioId: number;

  @ApiProperty({
    description: 'ID del tenant',
    example: 1,
  })
  tenantId: number;

  @ApiProperty({
    description: 'Rol del usuario en este tenant',
    enum: RolUsuario,
    example: RolUsuario.ADMIN_COOPERATIVA,
  })
  rol: RolUsuario;

  @ApiProperty({
    description: 'Fecha de asignación al tenant',
    example: '2023-07-15T10:30:00Z',
  })
  fechaAsignacion: Date;

  @ApiProperty({
    description: 'Estado de la asignación (activo/inactivo)',
    example: true,
  })
  activo: boolean;

  @ApiProperty({
    description: 'Información del tenant',
    type: () => TenantInfo,
  })
  tenant: TenantInfo;
}
