import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConfiguracionesTenantModule } from './modules/configuraciones-tenant/configuraciones-tenant.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { UsuarioTenantModule } from './modules/usuario-tenant/usuario-tenant.module';
import { TipoAsientosModule } from './modules/tipo-asientos/tipo-asientos.module';
import { ModelosBusModule } from './modules/modelos-bus/modelos-bus.module';
import { BusesModule } from './modules/buses/buses.module';
import { UbicacionAsientoPlantillasModule } from './modules/ubicacion-asiento-plantillas/ubicacion-asiento-plantillas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    UsuariosModule,
    ConfiguracionesTenantModule,
    ClientesModule,
    UsuarioTenantModule,
    TipoAsientosModule,
    ModelosBusModule,
    BusesModule,
    UbicacionAsientoPlantillasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
