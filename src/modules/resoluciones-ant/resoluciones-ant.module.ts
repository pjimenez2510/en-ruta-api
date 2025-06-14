import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ResolucionesAntController } from './resoluciones-ant.controller';
import { ResolucionesAntService } from './resoluciones-ant.service';

@Module({
  imports: [PrismaModule],
  controllers: [ResolucionesAntController],
  providers: [ResolucionesAntService],
  exports: [ResolucionesAntService],
})
export class ResolucionesAntModule {} 