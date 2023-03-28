import { path } from '@ffmpeg-installer/ffmpeg';
import { Module } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { FfmpegService } from './ffmpeg.service';

ffmpeg.setFfmpegPath(path);

@Module({
    providers: [
        FfmpegService,
        {
            provide: 'FFMPEG',
            useValue: ffmpeg
        }
    ],
    exports: [FfmpegService]
})
export class FfmpegModule {}
