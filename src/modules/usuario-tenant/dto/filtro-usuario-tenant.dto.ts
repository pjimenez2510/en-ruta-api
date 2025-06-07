import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsInt, IsEnum } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class FiltroUsuarioTenantDto {
  @ApiProperty({
    description: 'Filtrar por ID de usuario',
    required: false,
  })
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  usuarioId?: number;

  @ApiProperty({
    description: 'Filtrar por rol',
    enum: RolUsuario,
    required: false,
  })
  @IsEnum(RolUsuario, {
    message: 'El rol debe ser uno de los valores permitidos',
  })
  @IsOptional()
  rol?: RolUsuario;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  activo?: boolean = true;
}
