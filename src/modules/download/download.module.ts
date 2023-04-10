import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database/database.module';
import { GoogleapiModule } from 'src/lib/googleapi/googleapi.module';
import { DownloadGatewayModule } from 'src/lib/websocket/download-gateway.module';
import { CompressorModule } from '../compressor/compressor.module';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module';
import { YtdlModule } from '../ytdl/ytdl.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';

@Module({
    imports: [
        DownloadGatewayModule,
        CompressorModule,
        GoogleapiModule,
        DatabaseModule,
        FfmpegModule,
        YtdlModule
    ],
    controllers: [DownloadController],
    providers: [DownloadService],
    exports: [DownloadService]
})
export class DownloadModule {}
