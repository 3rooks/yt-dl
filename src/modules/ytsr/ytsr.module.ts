import { Module } from '@nestjs/common';
import * as ytsr from 'ytsr';

@Module({
    providers: [
        {
            provide: 'YTSR',
            useValue: ytsr
        }
    ],
    exports: ['YTSR']
})
export class YtsrModule {}
