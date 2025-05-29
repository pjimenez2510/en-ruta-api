import { Module } from '@nestjs/common';
import { ConfiguracionesTenantService } from './configuraciones-tenant.service';
import { ConfiguracionesTenantController } from './configuraciones-tenant.controller';

@Module({
  controllers: [ConfiguracionesTenantController],
  providers: [ConfiguracionesTenantService],
})
export class ConfiguracionesTenantModule {}
