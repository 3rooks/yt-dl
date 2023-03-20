import { path } from '@ffmpeg-installer/ffmpeg';
import { Module } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(path);

@Module({
    providers: [
        {
            provide: 'FFMPEG',
            useValue: ffmpeg
        }
    ],
    exports: ['FFMPEG']
})
export class FfmpegModule {}
