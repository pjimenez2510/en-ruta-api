import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from 'src/modules/tenant-context/tenant-context.service';

/**
 * Middleware para establecer el tenant ID en el contexto de la solicitud.
 * Extrae el tenant ID de varias fuentes y lo establece en el TenantContextService.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private tenantContextService: TenantContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantIdHeader = req.header('x-tenant-id');
    const tenantIdQuery = req.query.tenantId?.toString();

    let tenantIdFromUser: string | number | null = null;
    if (req.user && typeof req.user === 'object' && 'tenant' in req.user) {
      const userTenant = (req.user as any).tenant;
      if (userTenant && typeof userTenant === 'object' && 'id' in userTenant) {
        tenantIdFromUser = userTenant.id;
      }
    }

    const tenantIdValue = tenantIdHeader || tenantIdQuery || tenantIdFromUser;

    if (tenantIdValue) {
      try {
        const tenantId =
          typeof tenantIdValue === 'number'
            ? tenantIdValue
            : parseInt(tenantIdValue, 10);

        if (!isNaN(tenantId)) {
          this.tenantContextService.setCurrentTenantId(tenantId);
        }
      } catch (error) {
        console.warn(`Error al procesar tenant ID: ${tenantIdValue}`, error);
      }
    } else {
      this.tenantContextService.clearCurrentTenantId();
    }

    next();
  }
}
