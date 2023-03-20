import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module';
import { InfoModule } from '../info/info.module';
import { YtdlModule } from '../ytdl/ytdl.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { Download, DownloadSchema } from './schema/download.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Download.name,
                schema: DownloadSchema
            }
        ]),
        FfmpegModule,
        YtdlModule,
        InfoModule
    ],
    controllers: [DownloadController],
    providers: [DownloadService]
})
export class DownloadModule {}
