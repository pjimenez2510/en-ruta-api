import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreatePlantillaPisoDto } from './create-plantilla-piso.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlantillaPisoDto extends PartialType(
  CreatePlantillaPisoDto,
) {
  @ApiPropertyOptional({
    description:
      'Indica si la plantilla es pública para todas las cooperativas',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo esPublico debe ser un valor booleano' })
  esPublico?: boolean;
}
