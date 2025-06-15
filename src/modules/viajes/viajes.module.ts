import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ViajesController } from './viajes.controller';
import { ViajesService } from './viajes.service';
import { GeneracionViajesService } from './services/generacion-viajes.service';
import { ViajesPublicoService } from './services/viajes-publico.service';

@Module({
  imports: [PrismaModule],
  controllers: [ViajesController],
  providers: [ViajesService, GeneracionViajesService, ViajesPublicoService],
  exports: [ViajesService, GeneracionViajesService, ViajesPublicoService],
})
export class ViajesModule {} 