import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VentasController } from './ventas.controller';
import { BoletosController } from './boletos.controller';
import { VentasService } from './ventas.service';
import { BoletosService } from './boletos.service';

@Module({
  imports: [PrismaModule],
  controllers: [VentasController, BoletosController],
  providers: [VentasService, BoletosService],
  exports: [VentasService, BoletosService],
})
export class VentasModule {} 