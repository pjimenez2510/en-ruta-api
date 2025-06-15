import { ApiProperty } from '@nestjs/swagger';

export class EmailResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo del resultado',
    example: 'Email enviado exitosamente',
  })
  message: string;
}

export class EstadisticasEmailDto {
  @ApiProperty({
    description: 'Período de las estadísticas',
    example: 'Últimos 7 días',
  })
  periodo: string;

  @ApiProperty({
    description: 'Total de ventas en el período',
    example: 150,
  })
  totalVentas: number;

  @ApiProperty({
    description: 'Ventas con email del cliente',
    example: 140,
  })
  ventasConEmail: number;

  @ApiProperty({
    description: 'Porcentaje de cobertura de emails',
    example: '93.33',
  })
  porcentajeCobertura: string;

  @ApiProperty({
    description: 'Recordatorios enviados',
    example: 85,
  })
  recordatoriosEnviados: number;

  @ApiProperty({
    description: 'Boletos confirmados',
    example: 120,
  })
  boletosConfirmados: number;

  @ApiProperty({
    description: 'Tasa de recordatorios enviados',
    example: '70.83',
  })
  tasaRecordatorios: string;
}

export class EstadisticasResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Datos de las estadísticas',
    type: EstadisticasEmailDto,
  })
  data: EstadisticasEmailDto;
} 