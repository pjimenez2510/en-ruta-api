import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateTenantDto } from 'src/modules/tenants/dto';

export class RegistroCooperativaDto {
  @ApiProperty({
    description: 'Email para la cuenta de administrador',
    example: 'admin@cooperativa-esmeraldas.com',
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
    description: 'Datos de la cooperativa (tenant)',
    type: CreateTenantDto,
  })
  @IsNotEmpty({ message: 'Los datos de la cooperativa son requeridos' })
  @ValidateNested({ each: true })
  @Type(() => CreateTenantDto)
  tenant: CreateTenantDto;
}
