import { Module } from '@nestjs/common';
import * as ytdl from 'ytdl-core';

@Module({
    providers: [
        {
            provide: 'YTDL',
            useValue: ytdl
        }
    ],
    exports: ['YTDL']
})
export class YtdlModule {}
