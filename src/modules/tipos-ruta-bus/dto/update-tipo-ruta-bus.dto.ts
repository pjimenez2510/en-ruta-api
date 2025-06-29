import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { CreateTipoRutaBusDto } from './create-tipo-ruta-bus.dto';

export class UpdateTipoRutaBusDto extends PartialType(CreateTipoRutaBusDto) {} 