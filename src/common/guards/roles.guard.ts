import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TipoUsuario, RolUsuario } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      (TipoUsuario | RolUsuario)[]
    >('roles', [context.getHandler(), context.getClass()]);

    console.log('requiredRoles', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    console.log('user', user);

    if (!user) {
      return false;
    }

    if (requiredRoles.includes(user.tipoUsuario)) {
      return true;
    }

    const tenant = user.tenants[0];
    console.log('tenant', tenant);

    if (tenant && requiredRoles.includes(tenant.rol)) {
      console.log('true');
      return true;
    }

    return false;
  }
}
