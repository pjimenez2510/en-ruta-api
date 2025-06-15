import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConsultaDisponibilidadBusDto {
  @ApiProperty({
    description: 'ID del viaje',
    example: 1,
  })
  @IsInt({ message: 'El ID del viaje debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID del viaje es requerido' })
  @Transform(({ value }) => parseInt(value))
  viajeId: number;

  @ApiProperty({
    description: 'ID de la ciudad de origen',
    example: 1,
  })
  @IsInt({ message: 'El ID de la ciudad de origen debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la ciudad de origen es requerido' })
  @Transform(({ value }) => parseInt(value))
  ciudadOrigenId: number;

  @ApiProperty({
    description: 'ID de la ciudad de destino',
    example: 2,
  })
  @IsInt({ message: 'El ID de la ciudad de destino debe ser un número entero' })
  @IsNotEmpty({ message: 'El ID de la ciudad de destino es requerido' })
  @Transform(({ value }) => parseInt(value))
  ciudadDestinoId: number;
} 