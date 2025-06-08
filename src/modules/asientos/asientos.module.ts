import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AsientosController } from './asientos.controller';
import { AsientosService } from './asientos.service';

@Module({
  imports: [PrismaModule],
  controllers: [AsientosController],
  providers: [AsientosService],
  exports: [AsientosService],
})
export class AsientosModule {}
