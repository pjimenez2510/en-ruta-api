import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UbicacionAsientoPlantillasController } from './ubicacion-asiento-plantillas.controller';
import { UbicacionAsientoPlantillasService } from './ubicacion-asiento-plantillas.service';

@Module({
  imports: [PrismaModule],
  controllers: [UbicacionAsientoPlantillasController],
  providers: [UbicacionAsientoPlantillasService],
  exports: [UbicacionAsientoPlantillasService],
})
export class UbicacionAsientoPlantillasModule {}
