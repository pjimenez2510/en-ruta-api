import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { RolUsuario } from '../../../common/enums/user.enum';

export class AssignTenantDto {
  @ApiProperty({ description: 'ID del tenant (cooperativa) a asignar' })
  @IsInt()
  @IsNotEmpty()
  tenantId: number;

  @ApiProperty({
    description: 'Rol del usuario en el tenant',
    enum: RolUsuario,
  })
  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol: RolUsuario;
}
