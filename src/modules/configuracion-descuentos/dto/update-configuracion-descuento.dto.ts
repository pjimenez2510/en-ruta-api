import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateConfiguracionDescuentoDto } from './create-configuracion-descuento.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConfiguracionDescuentoDto extends PartialType(CreateConfiguracionDescuentoDto) {
  @ApiPropertyOptional({
    description: 'Estado de la configuración',
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  activo?: boolean;
} 