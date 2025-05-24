import { SetMetadata } from '@nestjs/common';
import { TipoUsuario, RolUsuario } from '@prisma/client';

export const Roles = (...roles: (TipoUsuario | RolUsuario)[]) =>
  SetMetadata('roles', roles);
