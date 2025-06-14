import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ParadasRutaController } from './paradas-ruta.controller';
import { ParadasRutaService } from './paradas-ruta.service';

@Module({
  imports: [PrismaModule],
  controllers: [ParadasRutaController],
  providers: [ParadasRutaService],
  exports: [ParadasRutaService],
})
export class ParadasRutaModule {} 