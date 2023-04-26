import { Module } from '@nestjs/common';
import { DownloadGatewayModule } from 'src/lib/websocket/download-gateway.module';
import { exec } from 'youtube-dl-exec';
import { GoogleapiModule } from '../googleapis/googleapis.module';
import { YoutubeDlService } from './youtubedl.service';

@Module({
    imports: [GoogleapiModule, DownloadGatewayModule],
    providers: [
        YoutubeDlService,
        {
            provide: 'YTDLEXEC',
            useValue: exec
        }
    ],
    exports: [YoutubeDlService]
})
export class YoutubeDlModule {}
