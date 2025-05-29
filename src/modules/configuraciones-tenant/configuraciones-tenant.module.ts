import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfiguracionesTenantService } from './configuraciones-tenant.service';
import { ConfiguracionesTenantController } from './configuraciones-tenant.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionesTenantController],
  providers: [ConfiguracionesTenantService],
  exports: [ConfiguracionesTenantService],
})
export class ConfiguracionesTenantModule {}
