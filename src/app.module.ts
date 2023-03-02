import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DlModule } from './dl/dl.module';

@Module({
  imports: [DlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
