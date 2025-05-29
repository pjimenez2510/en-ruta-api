import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { ConfigModule } from '@nestjs/config';
import { TenantContextModule } from './modules/tenant-context/tenant-context.module';
import { ConfiguracionesTenantModule } from './modules/configuraciones-tenant/configuraciones-tenant.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { UsuarioTenantModule } from './modules/usuario-tenant/usuario-tenant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    TenantsModule,
    UsuariosModule,
    AuthModule,
    TenantContextModule,
    ConfiguracionesTenantModule,
    ClientesModule,
    UsuarioTenantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
