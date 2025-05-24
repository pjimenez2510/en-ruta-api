import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTenantService } from './prisma-tenant.service';
import { TenantContextModule } from '../tenant-context/tenant-context.module';

@Global()
@Module({
  providers: [PrismaService, PrismaTenantService],
  exports: [PrismaService, PrismaTenantService],
  imports: [TenantContextModule],
})
export class PrismaModule {}
