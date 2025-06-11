import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CiudadesController } from './ciudades.controller';
import { CiudadesService } from './ciudades.service';

@Module({
  imports: [PrismaModule],
  controllers: [CiudadesController],
  providers: [CiudadesService],
  exports: [CiudadesService],
})
export class CiudadesModule {}
