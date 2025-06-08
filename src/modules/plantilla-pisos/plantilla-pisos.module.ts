import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PlantillaPisosController } from './plantilla-pisos.controller';
import { PlantillaPisosService } from './plantilla-pisos.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlantillaPisosController],
  providers: [PlantillaPisosService],
  exports: [PlantillaPisosService],
})
export class PlantillaPisosModule {}
