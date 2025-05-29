import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDate,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoDocumento } from '@prisma/client';

export class CreateClienteDto {
  @ApiProperty({
    description: 'Nombres del cliente',
    example: 'Juan Carlos',
  })
  @IsString({ message: 'Los nombres deben ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del cliente',
    example: 'Pérez Rodríguez',
  })
  @IsString({ message: 'Los apellidos deben ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  apellidos: string;

  @ApiProperty({
    description: 'Tipo de documento de identidad',
    enum: TipoDocumento,
    example: TipoDocumento.CEDULA,
  })
  @IsEnum(TipoDocumento, {
    message: 'El tipo de documento debe ser un valor válido',
  })
  @IsNotEmpty({ message: 'El tipo de documento es requerido' })
  tipoDocumento: TipoDocumento;

  @ApiProperty({
    description: 'Número de documento de identidad',
    example: '1712345678',
  })
  @IsString({
    message: 'El número de documento debe ser una cadena de caracteres',
  })
  @IsNotEmpty({ message: 'El número de documento es requerido' })
  numeroDocumento: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del cliente',
    example: '+593987654321',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de caracteres' })
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del cliente',
    example: 'juanperez@example.com',
  })
  @IsEmail(
    {},
    {
      message: 'El correo electrónico debe ser una dirección de correo válida',
    },
  )
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del cliente',
    example: '1990-01-15',
  })
  @IsDate({ message: 'La fecha de nacimiento debe ser una fecha válida' })
  @Type(() => Date)
  @IsOptional()
  fechaNacimiento?: Date;

  @ApiPropertyOptional({
    description: 'Indica si el cliente tiene alguna discapacidad',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'El estado de discapacidad debe ser un booleano' })
  @IsOptional()
  esDiscapacitado?: boolean;

  @ApiPropertyOptional({
    description: 'Porcentaje de discapacidad (si aplica)',
    example: 30.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El porcentaje de discapacidad debe ser un número válido' },
  )
  @Min(0, {
    message: 'El porcentaje de discapacidad debe ser mayor o igual a 0',
  })
  @Max(100, {
    message: 'El porcentaje de discapacidad debe ser menor o igual a 100',
  })
  @IsOptional()
  porcentajeDiscapacidad?: number;
}
