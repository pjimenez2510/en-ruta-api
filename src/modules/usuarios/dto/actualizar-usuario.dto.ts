import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TipoUsuario } from '@prisma/client';

export class ActualizarUsuarioDto {
  @ApiPropertyOptional({
    description: 'Username del usuario',
    example: 'usuario',
  })
  @IsString({ message: 'El username debe ser un texto' })
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Contraseña del usuario',
    example: 'nuevaContraseña123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Tipo de usuario',
    enum: TipoUsuario,
    example: TipoUsuario.CLIENTE,
  })
  @IsEnum(TipoUsuario, { message: 'El tipo de usuario no es válido' })
  @IsOptional()
  tipoUsuario?: TipoUsuario;

  @ApiPropertyOptional({
    description: 'Estado del usuario (activo/inactivo)',
    example: true,
  })
  @IsOptional()
  activo?: boolean;
}
