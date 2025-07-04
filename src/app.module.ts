import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfiguracionesTenantModule } from './modules/configuraciones-tenant/configuraciones-tenant.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { UsuarioTenantModule } from './modules/usuario-tenant/usuario-tenant.module';
import { TipoAsientosModule } from './modules/tipo-asientos/tipo-asientos.module';
import { ModelosBusModule } from './modules/modelos-bus/modelos-bus.module';
import { BusesModule } from './modules/buses/buses.module';
import { UbicacionAsientoPlantillasModule } from './modules/ubicacion-asiento-plantillas/ubicacion-asiento-plantillas.module';
import { PlantillaPisosModule } from './modules/plantilla-pisos/plantilla-pisos.module';
import { AsientosModule } from './modules/asientos/asientos.module';
import { PisosBusModule } from './modules/pisos-bus/pisos-bus.module';
import { CiudadesModule } from './modules/ciudades/ciudades.module';
import { ResolucionesAntModule } from './modules/resoluciones-ant/resoluciones-ant.module';
import { RutasModule } from './modules/rutas/rutas.module';
import { ParadasRutaModule } from './modules/paradas-ruta/paradas-ruta.module';
import { HorariosRutaModule } from './modules/horarios-ruta/horarios-ruta.module';
import { ViajesModule } from './modules/viajes/viajes.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { MetodosPagoModule } from './modules/metodos-pago/metodos-pago.module';
import { ConfiguracionDescuentosModule } from './modules/configuracion-descuentos/configuracion-descuentos.module';
import { EmailModule } from './modules/email/email.module';
import { TiposRutaBusModule } from './modules/tipos-ruta-bus/tipos-ruta-bus.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
    PisosBusModule,
    AsientosModule,
    PlantillaPisosModule,
    UbicacionAsientoPlantillasModule,
    CiudadesModule,
    ResolucionesAntModule,
    RutasModule,
    ParadasRutaModule,
    HorariosRutaModule,
    ViajesModule,
    VentasModule,
    MetodosPagoModule,
    ConfiguracionDescuentosModule,
    EmailModule,
    TiposRutaBusModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
