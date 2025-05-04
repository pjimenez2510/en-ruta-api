import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDecimal,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { TipoUsuario } from '../../../common/enums/user.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario, será usado para inicio de sesión',
    example: 'usuario@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description:
      'Cédula del usuario, opcional pero debe ser único si se proporciona',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  cedula?: string;

  @ApiProperty({ description: 'Nombres del usuario', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty({ description: 'Apellidos del usuario', example: 'Perez' })
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty({
    description: 'Fecha de nacimiento del usuario',
    required: false,
    example: '1990-01-01',
  })
  @IsDate()
  @IsOptional()
  fechaNacimiento?: Date;

  @ApiProperty({
    description: 'Número de teléfono del usuario',
    required: false,
    example: '0987654321',
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({
    description: 'Indica si el usuario tiene discapacidad',
    default: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  esDiscapacitado?: boolean;

  @ApiProperty({
    description:
      'Porcentaje de discapacidad, requerido si esDiscapacitado es true',
    required: false,
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  porcentajeDiscapacidad?: number;

  @ApiProperty({
    description: 'Tipo de usuario',
    enum: TipoUsuario,
    default: TipoUsuario.CLIENTE,
    example: TipoUsuario.CLIENTE,
  })
  @IsEnum(TipoUsuario)
  @IsOptional()
  tipoUsuario?: TipoUsuario;
}
