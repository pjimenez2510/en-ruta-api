import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
