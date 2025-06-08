import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { CreateAsientoItemDto } from './create-asiento-item.dto';

export class CreateAsientosMasivoDto {
  @ApiProperty({
    description: 'ID del piso del bus para el cual se crearán los asientos',
    example: 1,
  })
  @IsInt({ message: 'El ID del piso del bus debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del piso del bus es requerido' })
  pisoBusId: number;

  @ApiProperty({
    description: 'Lista de asientos a crear',
    type: [CreateAsientoItemDto],
  })
  @IsArray({ message: 'El campo asientos debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un asiento' })
  @ValidateNested({ each: true })
  @Type(() => CreateAsientoItemDto)
  asientos: CreateAsientoItemDto[];
}
