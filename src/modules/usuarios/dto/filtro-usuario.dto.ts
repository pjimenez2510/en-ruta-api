import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';
import { TipoUsuario } from '@prisma/client';

export class FiltroUsuarioDto {
  @ApiProperty({
    description: 'Filtrar por email',
    required: false,
  })
  @IsString({ message: 'El email debe ser una cadena de caracteres' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de usuario',
    enum: TipoUsuario,
    required: false,
  })
  @IsEnum(TipoUsuario, { message: 'El tipo de usuario no es válido' })
  @IsOptional()
  tipoUsuario?: TipoUsuario;

  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
  })
  @IsBoolean({ message: 'El estado activo debe ser un booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  activo?: boolean = true;
}
