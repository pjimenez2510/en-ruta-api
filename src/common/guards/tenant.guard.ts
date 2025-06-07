import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const tenantRequired = this.reflector.getAllAndOverride<boolean>(
      'require-tenant',
      [context.getHandler(), context.getClass()],
    );

    if (!tenantRequired) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const tenant = user.tenants[0];

    if (!tenant || !tenant.id) {
      throw new UnauthorizedException(
        'Se requiere acceso a un tenant para esta acción',
      );
    }

    return true;
  }
}
