import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VentasController } from './ventas.controller';
import { BoletosController } from './boletos.controller';
import { VentasService } from './ventas.service';
import { BoletosService } from './boletos.service';
import { DescuentoCalculatorService } from './services/descuento-calculator.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [VentasController, BoletosController],
  providers: [VentasService, BoletosService, DescuentoCalculatorService],
  exports: [VentasService, BoletosService, DescuentoCalculatorService],
})
export class VentasModule {} 