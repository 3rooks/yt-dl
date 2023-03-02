import { Module } from '@nestjs/common';
import { DlService } from './dl.service';
import { DlController } from './dl.controller';

@Module({
  controllers: [DlController],
  providers: [DlService],
})
export class DlModule {}
