import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Contraseña del usuario (opcional para actualización)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
