import { Module } from '@nestjs/common';
import { UsuarioTenantService } from './usuario-tenant.service';
import { UsuarioTenantController } from './usuario-tenant.controller';

@Module({
  controllers: [UsuarioTenantController],
  providers: [UsuarioTenantService],
})
export class UsuarioTenantModule {}
