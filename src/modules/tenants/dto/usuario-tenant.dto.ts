import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class AsignarUsuarioTenantDto {
  @ApiProperty({
    description: 'ID del usuario a asignar',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  usuarioId: number;

  @ApiProperty({
    description: 'Rol que tendrá el usuario en el tenant',
    enum: RolUsuario,
    example: RolUsuario.OFICINISTA,
  })
  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;
}

export class UsuarioTenantResponseDto {
  @ApiProperty({
    description: 'ID del registro',
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
    description: 'Rol del usuario en el tenant',
    enum: RolUsuario,
    example: RolUsuario.OFICINISTA,
  })
  rol: RolUsuario;

  @ApiProperty({
    description: 'Fecha de asignación',
    example: '2023-01-01T00:00:00Z',
  })
  fechaAsignacion: Date;

  @ApiProperty({
    description: 'Estado activo de la asignación',
    example: true,
  })
  activo: boolean;
}
