import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateUbicacionAsientoPlantillaDto } from './create-ubicacion-asiento-plantilla.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUbicacionAsientoPlantillaDto extends PartialType(
  CreateUbicacionAsientoPlantillaDto,
) {
  @ApiPropertyOptional({
    description: 'Indica si la ubicación está habilitada',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo estaHabilitado debe ser un valor booleano' })
  estaHabilitado?: boolean;
}
