import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PisosBusController } from './pisos-bus.controller';
import { PisosBusService } from './pisos-bus.service';

@Module({
  imports: [PrismaModule],
  controllers: [PisosBusController],
  providers: [PisosBusService],
  exports: [PisosBusService],
})
export class PisosBusModule {}
