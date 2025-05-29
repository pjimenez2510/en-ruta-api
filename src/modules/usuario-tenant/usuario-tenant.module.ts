import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuarioTenantService } from './usuario-tenant.service';
import { UsuarioTenantController } from './usuario-tenant.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsuarioTenantController],
  providers: [UsuarioTenantService],
  exports: [UsuarioTenantService],
})
export class UsuarioTenantModule {}
