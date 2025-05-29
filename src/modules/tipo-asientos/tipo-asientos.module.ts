import { Module } from '@nestjs/common';
import { TipoAsientosService } from './tipo-asientos.service';
import { TipoAsientosController } from './tipo-asientos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TipoAsientosController],
  providers: [TipoAsientosService],
  exports: [TipoAsientosService],
})
export class TipoAsientosModule {}
