import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateIf,
  IsNumber,
  IsBoolean,
  IsJSON,
} from 'class-validator';
import { TipoConfiguracion } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateConfiguracionesTenantDto {
  @ApiProperty({
    description: 'Clave única de la configuración',
    example: 'LOGO_URL',
  })
  @IsString({ message: 'La clave debe ser una cadena de caracteres' })
  @IsNotEmpty({ message: 'La clave es requerida' })
  clave: string;

  @ApiPropertyOptional({
    description: 'Valor de la configuración',
    example: 'https://ejemplo.com/logo.png',
  })
  @IsString({ message: 'El valor debe ser una cadena de caracteres' })
  @IsOptional()
  valor?: string;

  @ApiProperty({
    description: 'Tipo de configuración',
    enum: TipoConfiguracion,
    example: TipoConfiguracion.TEXTO,
  })
  @IsEnum(TipoConfiguracion, { message: 'El tipo debe ser un valor válido' })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo: TipoConfiguracion;

  @ApiPropertyOptional({
    description: 'Descripción de la configuración',
    example: 'URL del logotipo de la cooperativa',
  })
  @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'ID del tenant al que pertenece la configuración',
    example: 1,
  })
  @IsNumber({}, { message: 'El ID del tenant debe ser un número' })
  @IsNotEmpty({ message: 'El ID del tenant es requerido' })
  tenantId: number;

  @ValidateIf((o) => o.tipo === TipoConfiguracion.NUMERO)
  @IsNumber({}, { message: 'Para el tipo NUMERO, el valor debe ser numérico' })
  @Transform(({ value, obj }) => {
    if (obj.tipo === TipoConfiguracion.NUMERO && typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  numeroValor?: number;

  @ValidateIf((o) => o.tipo === TipoConfiguracion.BOOLEANO)
  @IsBoolean({ message: 'Para el tipo BOOLEANO, el valor debe ser booleano' })
  @Transform(({ value, obj }) => {
    if (obj.tipo === TipoConfiguracion.BOOLEANO && typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  booleanoValor?: boolean;

  @ValidateIf((o) => o.tipo === TipoConfiguracion.JSON)
  @IsJSON({ message: 'Para el tipo JSON, el valor debe ser un JSON válido' })
  jsonValor?: string;
}
