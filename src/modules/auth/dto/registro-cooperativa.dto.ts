import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateTenantDto } from 'src/modules/tenants/dto';

export class RegistroCooperativaDto {
  @ApiProperty({
    description: 'Username para la cuenta de administrador',
    example: 'admincooperativa',
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
    description: 'Datos de la cooperativa (tenant)',
    type: CreateTenantDto,
  })
  @IsNotEmpty({ message: 'Los datos de la cooperativa son requeridos' })
  @ValidateNested({ each: true })
  @Type(() => CreateTenantDto)
  tenant: CreateTenantDto;
}
