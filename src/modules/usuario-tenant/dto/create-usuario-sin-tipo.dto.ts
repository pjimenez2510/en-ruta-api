import { OmitType } from '@nestjs/swagger';
import { CrearUsuarioDto } from '../../usuarios/dto';

export class CrearUsuarioSinTipoDto extends OmitType(CrearUsuarioDto, [
  'tipoUsuario',
]) {}
