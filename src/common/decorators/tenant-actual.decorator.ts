import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const TenantActual = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.user?.tenants[0]?.tenant;

    if (!tenant) {
      throw new UnauthorizedException('No hay tenant activo para este usuario');
    }

    return tenant;
  },
);
