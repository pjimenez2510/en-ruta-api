import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioTenantDto } from './create-usuario-tenant.dto';
import { RolUsuario } from '@prisma/client';

export class UpdateUsuarioTenantDto extends PartialType(
  CreateUsuarioTenantDto,
) {
  @ApiPropertyOptional({
    description: 'Rol que tendrá el usuario en el tenant',
    enum: RolUsuario,
    example: RolUsuario.OFICINISTA,
  })
  @IsEnum(RolUsuario, {
    message: 'El rol debe ser uno de los valores permitidos',
  })
  @IsOptional()
  rol?: RolUsuario;

  @ApiPropertyOptional({
    description: 'Estado activo de la relación usuario-tenant',
    example: true,
  })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  @IsOptional()
  activo?: boolean;
}
