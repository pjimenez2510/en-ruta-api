import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateClienteDto } from 'src/modules/clientes/dto';

export class RegistroClienteDto {
  @ApiProperty({
    description: 'Email para la cuenta de usuario',
    example: 'cliente@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe ser un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña para la cuenta',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Datos del cliente',
    type: CreateClienteDto,
  })
  @IsNotEmpty({ message: 'Los datos del cliente son requeridos' })
  @ValidateNested()
  @Type(() => CreateClienteDto)
  cliente: CreateClienteDto;
}
