import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreatePisoBusDto } from './create-piso-bus.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdatePisoBusDto extends PartialType(CreatePisoBusDto) {
  @ApiPropertyOptional({
    description: 'ID de la plantilla de piso',
    example: 2,
  })
  @IsInt({ message: 'El ID de la plantilla de piso debe ser un número entero' })
  @IsOptional()
  plantillaPisoId?: number;
}
