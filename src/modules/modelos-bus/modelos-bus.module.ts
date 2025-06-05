import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ModelosBusController } from './modelos-bus.controller';
import { ModelosBusService } from './modelos-bus.service';

@Module({
  imports: [PrismaModule],
  controllers: [ModelosBusController],
  providers: [ModelosBusService],
  exports: [ModelosBusService],
})
export class ModelosBusModule {}
