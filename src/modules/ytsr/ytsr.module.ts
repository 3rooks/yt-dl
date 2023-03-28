import { Module } from '@nestjs/common';
import * as ytsr from 'ytsr';
import { YtsrService } from './ytsr.service';

@Module({
    providers: [
        YtsrService,
        {
            provide: 'YTSR',
            useValue: ytsr
        }
    ],
    exports: [YtsrService]
})
export class YtsrModule {}
