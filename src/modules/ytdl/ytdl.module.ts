import { Module } from '@nestjs/common';
import * as ytdl from 'ytdl-core';
import { YtdlService } from './ytdl.service';

@Module({
    providers: [
        YtdlService,
        {
            provide: 'YTDL',
            useValue: ytdl
        }
    ],
    exports: [YtdlService]
})
export class YtdlModule {}
