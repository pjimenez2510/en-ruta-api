import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TipoUsuario } from '@prisma/client';

export class CrearUsuarioDto {
  @ApiProperty({
    description: 'Username del usuario',
    example: 'usuario',
  })
  @IsString({ message: 'El username debe ser un texto' })
  @IsNotEmpty({ message: 'El username es requerido' })
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'contraseña123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiPropertyOptional({
    description: 'Tipo de usuario',
    enum: TipoUsuario,
    example: TipoUsuario.CLIENTE,
    default: TipoUsuario.CLIENTE,
  })
  @IsEnum(TipoUsuario, { message: 'El tipo de usuario no es válido' })
  @IsOptional()
  tipoUsuario?: TipoUsuario;
}
