import { PartialType } from '@nestjs/swagger';
import { CreateParadaRutaDto } from './create-parada-ruta.dto';

export class UpdateParadaRutaDto extends PartialType(CreateParadaRutaDto) {} 