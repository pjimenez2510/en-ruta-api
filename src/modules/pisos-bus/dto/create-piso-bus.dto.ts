import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePisoBusDto {
  @ApiProperty({
    description: 'ID del bus al que pertenece el piso',
    example: 1,
  })
  @IsInt({ message: 'El ID del bus debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del bus es requerido' })
  busId: number;

  @ApiProperty({
    description: 'Número del piso',
    example: 1,
  })
  @IsInt({ message: 'El número de piso debe ser un número entero' })
  @IsNotEmpty({ message: 'El número de piso es requerido' })
  numeroPiso: number;

  @ApiPropertyOptional({
    description: 'ID de la plantilla de piso (opcional)',
    example: 1,
  })
  @IsInt({ message: 'El ID de la plantilla de piso debe ser un número entero' })
  @IsOptional()
  plantillaPisoId?: number;
}
