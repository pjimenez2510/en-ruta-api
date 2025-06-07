import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsuarioTenantService } from './usuario-tenant.service';
import { UsuarioTenantController } from './usuario-tenant.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { PersonalCooperativaModule } from '../personal-cooperativa/personal-cooperativa.module';

@Module({
  imports: [PrismaModule, UsuariosModule, PersonalCooperativaModule],
  controllers: [UsuarioTenantController],
  providers: [UsuarioTenantService],
  exports: [UsuarioTenantService],
})
export class UsuarioTenantModule {}
