import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class CambiarTenantDto {
  @ApiProperty({
    description: 'ID del tenant al que se quiere cambiar',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  tenantId: number;
}
