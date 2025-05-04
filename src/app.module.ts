import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BusesModule } from './modules/buses/buses.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [AuthModule, BusesModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
