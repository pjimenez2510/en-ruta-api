import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ActualizarUsuarioDto } from '../../usuarios/dto';
import { UpdatePersonalCooperativaDto } from '../../personal-cooperativa/dto';
import { RolUsuario } from '@prisma/client';
import { UpdateUsuarioSinTipoDto } from './update-usuario-sin-tipo.dto';
export class UpdateUsuarioTenantDto {
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

  @ApiPropertyOptional({
    description: 'Datos del usuario a actualizar',
    type: () => UpdateUsuarioSinTipoDto,
  })
  @IsOptional()
  @IsObject({ message: 'Los datos del usuario deben ser un objeto válido' })
  @ValidateNested()
  @Type(() => UpdateUsuarioSinTipoDto)
  usuario?: UpdateUsuarioSinTipoDto;

  @ApiPropertyOptional({
    description: 'Datos personales del usuario en la cooperativa',
    type: () => UpdatePersonalCooperativaDto,
  })
  @IsOptional()
  @IsObject({ message: 'Los datos personales deben ser un objeto válido' })
  @ValidateNested()
  @Type(() => UpdatePersonalCooperativaDto)
  infoPersonal?: UpdatePersonalCooperativaDto;
}
