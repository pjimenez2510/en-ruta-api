import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PersonalCooperativaService } from './personal-cooperativa.service';

@Module({
  imports: [PrismaModule],
  providers: [PersonalCooperativaService],
  exports: [PersonalCooperativaService],
})
export class PersonalCooperativaModule {}
