import { OmitType } from '@nestjs/swagger';
import { ActualizarUsuarioDto } from 'src/modules/usuarios/dto';

export class UpdateUsuarioSinTipoDto extends OmitType(ActualizarUsuarioDto, [
  'tipoUsuario',
]) {}
