import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

@Injectable()
export class PrismaTenantService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) {}

  get tenant() {
    return this.tenantContext.getCurrentTenantId();
  }

  get bus() {
    return this.applyTenantFilter(this.prisma.bus);
  }

  get tipoAsiento() {
    return this.applyTenantFilter(this.prisma.tipoAsiento);
  }

  get ruta() {
    return this.applyTenantFilter(this.prisma.ruta);
  }

  get configuracionDescuento() {
    return this.applyTenantFilter(this.prisma.configuracionDescuento);
  }

  get hojaTrabajo() {
    return this.applyTenantFilter(this.prisma.hojaTrabajo);
  }

  get venta() {
    return this.applyTenantFilter(this.prisma.venta);
  }

  get boleto() {
    return this.applyTenantFilter(this.prisma.boleto);
  }

  get configuracion() {
    return this.applyTenantFilter(this.prisma.configuracion);
  }

  get notificacion() {
    return this.applyTenantFilter(this.prisma.notificacion);
  }

  get metodoPago() {
    return this.applyTenantFilter(this.prisma.metodoPago);
  }

  /**
   * Modelos que no tienen tenantId
   */
  get usuario() {
    return this.prisma.usuario;
  }

  get cliente() {
    return this.prisma.cliente;
  }

  get usuarioTenant() {
    return this.prisma.usuarioTenant;
  }

  get ciudad() {
    return this.prisma.ciudad;
  }

  get resolucionANT() {
    return this.prisma.resolucionANT;
  }

  private applyTenantFilter<
    T extends {
      findMany: any;
      findFirst: any;
      findUnique: any;
      create: any;
      update: any;
      delete: any;
    },
  >(model: T): T {
    const tenantId = this.tenantContext.getCurrentTenantId();
    if (!tenantId) {
      return model;
    }

    return new Proxy(model, {
      get: (target, prop) => {
        const originalMethod = target[prop];

        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        switch (prop) {
          case 'findMany':
            return (args: any = {}) => {
              args.where = { ...args.where, tenantId };
              return originalMethod.call(target, args);
            };

          case 'findFirst':
          case 'findUnique':
            return (args: any = {}) => {
              args.where = { ...args.where, tenantId };
              return originalMethod.call(target, args);
            };

          case 'create':
            return (args: any = {}) => {
              args.data = { ...args.data, tenantId };
              return originalMethod.call(target, args);
            };

          case 'createMany':
            return (args: any = {}) => {
              if (Array.isArray(args.data)) {
                args.data = args.data.map((item: any) => ({
                  ...item,
                  tenantId,
                }));
              } else {
                args.data = { ...args.data, tenantId };
              }
              return originalMethod.call(target, args);
            };

          case 'update':
          case 'updateMany':
            return (args: any = {}) => {
              args.where = { ...args.where, tenantId };
              return originalMethod.call(target, args);
            };

          case 'delete':
          case 'deleteMany':
            return (args: any = {}) => {
              args.where = { ...args.where, tenantId };
              return originalMethod.call(target, args);
            };

          default:
            return originalMethod;
        }
      },
    }) as T;
  }
}
