import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './src/modules/auth/auth.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusesModule } from './modules/buses/buses.module';

@Module({
  imports: [AuthModule, BusesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
