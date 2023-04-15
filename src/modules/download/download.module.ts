import { Module } from '@nestjs/common';
import { CompressorModule } from '../../lib/compressor/compressor.module';
import { GoogleapiModule } from '../../lib/googleapis/googleapis.module';
import { DownloadGatewayModule } from '../../lib/websocket/download-gateway.module';
import { YoutubeDlModule } from '../../lib/youtube-dl/youtubedl.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';

@Module({
    imports: [
        DownloadGatewayModule,
        CompressorModule,
        GoogleapiModule,
        YoutubeDlModule
    ],
    controllers: [DownloadController],
    providers: [DownloadService],
    exports: [DownloadService]
})
export class DownloadModule {}
