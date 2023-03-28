import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { GoogleapiModule } from 'src/lib/googleapi/googleapi.module';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module';
import { YtdlModule } from '../ytdl/ytdl.module';
import { YtsrModule } from '../ytsr/ytsr.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { Download, DownloadSchema } from './schema/download.schema';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([
            {
                name: Download.name,
                schema: DownloadSchema
            }
        ]),
        GoogleapiModule,
        FfmpegModule,
        YtsrModule,
        YtdlModule
    ],
    controllers: [DownloadController],
    providers: [DownloadService]
})
export class DownloadModule {}
