import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CrearUsuarioSinTipoDto } from './create-usuario-sin-tipo.dto';
import { Type } from 'class-transformer';
import { CreatePersonalCooperativaDto } from 'src/modules/personal-cooperativa/dto';
import { RolUsuario } from '@prisma/client';

export class CreateUsuarioTenantDto {
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
    description:
      'Datos del usuario a crear (sin tipo, será PERSONAL_COOPERATIVA automáticamente)',
    type: () => CrearUsuarioSinTipoDto,
  })
  @IsObject({ message: 'Los datos del usuario deben ser un objeto válido' })
  @ValidateNested()
  @Type(() => CrearUsuarioSinTipoDto)
  usuario: CrearUsuarioSinTipoDto;

  @ApiProperty({
    description: 'Datos personales del usuario en la cooperativa',
    type: () => CreatePersonalCooperativaDto,
  })
  @IsObject({ message: 'Los datos personales deben ser un objeto válido' })
  @ValidateNested()
  @Type(() => CreatePersonalCooperativaDto)
  infoPersonal: CreatePersonalCooperativaDto;

  tenantId: number;
}
