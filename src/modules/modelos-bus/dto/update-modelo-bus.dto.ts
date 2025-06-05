import { PartialType } from '@nestjs/swagger';
import { CreateModeloBusDto } from './create-modelo-bus.dto';

export class UpdateModeloBusDto extends PartialType(CreateModeloBusDto) {}
