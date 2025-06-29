import { ApiProperty } from '@nestjs/swagger';
import { EstadoViaje, TipoGeneracion } from '@prisma/client';

export class ViajeGeneradoDto {
  @ApiProperty({
    description: 'Fecha del viaje',
    example: new Date(),
  })
  fecha: Date;


  @ApiProperty({
    description: 'Información del horario de ruta',
  })
  horarioRuta: {
    id: number;
    horaSalida: string;
    ruta: {
      id: number;
      nombre: string;
      descripcion?: string;
      tipoRutaBus: {
        id: number;
        nombre: string;
      };
    };
  };

  @ApiProperty({
    description: 'Información del bus asignado',
  })
  bus: {
    id: number;
    numero: number;
    placa: string;
    totalAsientos: number;
    tipoRutaBus: {
      id: number;
      nombre: string;
    };
  };

  @ApiProperty({
    description: 'Estado del viaje',
    enum: EstadoViaje,
  })
  estado: EstadoViaje;

  @ApiProperty({
    description: 'Capacidad total de asientos',
    example: 45,
  })
  capacidadTotal: number;

  @ApiProperty({
    description: 'Tipo de generación',
    enum: TipoGeneracion,
  })
  generacion: TipoGeneracion;

  @ApiProperty({
    description: 'ID del viaje',
    example: 1,
  })
  id?: number = null;

  @ApiProperty({
    description: 'ID del tenant',
    example: 1,
  })
  tenantId: number = null;

  @ApiProperty({
    description: 'ID del conductor',
    example: 1,
  })
  conductorId?: number = null;

  @ApiProperty({
    description: 'ID del ayudante',
    example: 1,
  })
  ayudanteId?: number = null;

  @ApiProperty({
    description: 'Hora de salida real',
    example: new Date(),
  })
  horaSalidaReal?: Date = null;

  @ApiProperty({
    description: 'Asientos ocupados',
    example: 10,
  })
  asientosOcupados?: number = 0;

  @ApiProperty({
    description: 'Observaciones',
    example: 'Observaciones',
  })
  observaciones?: string = null;
}

