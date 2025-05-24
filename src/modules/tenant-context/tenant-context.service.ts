import { Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable({ scope: Scope.DEFAULT })
export class TenantContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<
    Map<string, any>
  >();

  constructor() {
    if (!this.asyncLocalStorage.getStore()) {
      this.asyncLocalStorage.enterWith(new Map<string, any>());
    }
  }

  setCurrentTenantId(tenantId: number): void {
    this.getStore().set('tenantId', tenantId);
  }

  getCurrentTenantId(): number | null {
    return this.getStore().get('tenantId') || null;
  }

  clearCurrentTenantId(): void {
    this.getStore().delete('tenantId');
  }

  runWithTenantId<T>(tenantId: number, callback: () => T): T {
    const store = new Map<string, any>();
    store.set('tenantId', tenantId);

    return this.asyncLocalStorage.run(store, callback);
  }

  private getStore(): Map<string, any> {
    let store = this.asyncLocalStorage.getStore();
    if (!store) {
      store = new Map<string, any>();
      this.asyncLocalStorage.enterWith(store);
    }
    return store;
  }
}
