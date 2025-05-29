import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateClienteDto } from 'src/modules/clientes/dto';

export class RegistroClienteDto {
  @ApiProperty({
    description: 'Username para la cuenta de usuario',
    example: 'cliente',
  })
  @IsString({ message: 'El username debe ser un texto' })
  @IsNotEmpty({ message: 'El username es requerido' })
  username: string;

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
