import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HorariosRutaController } from './horarios-ruta.controller';
import { HorariosRutaService } from './horarios-ruta.service';

@Module({
  imports: [PrismaModule],
  controllers: [HorariosRutaController],
  providers: [HorariosRutaService],
  exports: [HorariosRutaService],
})
export class HorariosRutaModule {} 