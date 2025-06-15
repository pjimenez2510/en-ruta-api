import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfiguracionDescuentosController } from './configuracion-descuentos.controller';
import { ConfiguracionDescuentosService } from './configuracion-descuentos.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConfiguracionDescuentosController],
  providers: [ConfiguracionDescuentosService],
  exports: [ConfiguracionDescuentosService],
})
export class ConfiguracionDescuentosModule {} 