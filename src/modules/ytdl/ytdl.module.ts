import { Module } from '@nestjs/common';
import { DownloadGatewayModule } from 'src/lib/websocket/download-gateway.module';
import * as ytdl from 'ytdl-core';
import { YtdlService } from './ytdl.service';

@Module({
    imports: [DownloadGatewayModule],
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
