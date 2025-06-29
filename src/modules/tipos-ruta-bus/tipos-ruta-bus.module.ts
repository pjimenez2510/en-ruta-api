import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TiposRutaBusController } from './tipos-ruta-bus.controller';
import { TiposRutaBusService } from './tipos-ruta-bus.service';

@Module({
  imports: [PrismaModule],
  controllers: [TiposRutaBusController],
  providers: [TiposRutaBusService],
  exports: [TiposRutaBusService],
})
export class TiposRutaBusModule {} 