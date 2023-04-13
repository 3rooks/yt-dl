import { Module } from '@nestjs/common';
import { GoogleapiModule } from '../../lib/googleapis/googleapis.module';
import { DownloadGatewayModule } from '../../lib/websocket/download-gateway.module';
import { CompressorModule } from '../compressor/compressor.module';
import { YoutubeDlModule } from '../youtube-dl/youtubedl.module';
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
