import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class FiltroPisoBusDto {
  @ApiProperty({
    description: 'Filtrar por ID del bus',
    required: false,
  })
  @IsInt({ message: 'El ID del bus debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  busId?: number;

  @ApiProperty({
    description: 'Filtrar por número de piso',
    required: false,
  })
  @IsInt({ message: 'El número de piso debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  numeroPiso?: number;

  @ApiProperty({
    description: 'Filtrar por ID de la plantilla de piso',
    required: false,
  })
  @IsInt({ message: 'El ID de la plantilla de piso debe ser un número entero' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  plantillaPisoId?: number;
}
