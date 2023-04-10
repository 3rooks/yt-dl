import { Module } from '@nestjs/common';
import { DownloadGatewayModule } from 'src/lib/websocket/download-gateway.module';
import { exec } from 'youtube-dl-exec';
import { YoutubeDlService } from './youtubedl.service';

@Module({
    imports: [DownloadGatewayModule],
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
