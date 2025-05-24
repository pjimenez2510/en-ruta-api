import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoUsuario } from '@prisma/client';

export class TenantInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Cooperativa Esmeraldas' })
  nombre: string;

  @ApiProperty({ example: 'esmeraldas' })
  identificador: string;
}

export class PerfilUsuarioDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Tipo de usuario',
    enum: TipoUsuario,
    example: TipoUsuario.CLIENTE,
  })
  tipoUsuario: TipoUsuario;

  @ApiProperty({
    description: 'Fecha de registro',
    example: '2023-07-15T10:30:00Z',
  })
  fechaRegistro: Date;

  @ApiPropertyOptional({
    description: 'Fecha del último acceso',
    example: '2023-07-20T15:45:00Z',
    nullable: true,
  })
  ultimoAcceso: Date | null;

  @ApiProperty({
    description: 'Estado del usuario (activo/inactivo)',
    example: true,
  })
  activo: boolean;

  @ApiPropertyOptional({
    description: 'Información del tenant activo',
    type: TenantInfoDto,
    nullable: true,
  })
  tenant?: TenantInfoDto | null;

  @ApiPropertyOptional({
    description: 'Roles del usuario en el tenant actual',
    type: [String],
    example: ['ADMIN_COOPERATIVA'],
    nullable: true,
  })
  roles?: string[] | null;
}
