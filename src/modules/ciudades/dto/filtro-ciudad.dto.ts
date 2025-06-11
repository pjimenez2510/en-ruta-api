import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FiltroCiudadDto {
  @ApiProperty({
    description: 'Filtrar por estado activo',
    required: false,
  })
  @IsBoolean({ message: 'El activo debe ser un booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  activo?: boolean = true;

  @ApiProperty({
    description: 'Filtrar por nombre de ciudad',
    required: false,
  })
  @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
  @IsOptional()
  nombre?: string;

  @ApiProperty({
    description: 'Filtrar por provincia',
    required: false,
  })
  @IsString({ message: 'La provincia debe ser una cadena de caracteres' })
  @IsOptional()
  provincia?: string;
}
