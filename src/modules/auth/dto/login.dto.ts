import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Username del usuario',
    example: 'admin',
  })
  @IsString({ message: 'El username debe ser un texto' })
  @IsNotEmpty({ message: 'El username es requerido' })
  username: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'admin',
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
