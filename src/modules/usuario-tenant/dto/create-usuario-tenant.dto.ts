import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CreateUsuarioTenantDto {
  @ApiProperty({
    description: 'ID del usuario a asignar al tenant',
    example: 1,
  })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  usuarioId: number;

  @ApiProperty({
    description: 'ID del tenant al que se asignará el usuario',
    example: 1,
  })
  @IsInt({ message: 'El ID del tenant debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del tenant es requerido' })
  tenantId: number;

  @ApiProperty({
    description: 'Rol que tendrá el usuario en el tenant',
    enum: RolUsuario,
    example: RolUsuario.OFICINISTA,
  })
  @IsEnum(RolUsuario, {
    message: 'El rol debe ser uno de los valores permitidos',
  })
  @IsNotEmpty({ message: 'El rol es requerido' })
  rol: RolUsuario;

  @ApiProperty({
    description: 'Estado activo de la relación usuario-tenant',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  @IsOptional()
  activo?: boolean;
}
