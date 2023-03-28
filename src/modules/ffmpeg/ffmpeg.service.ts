import { Inject, Injectable } from '@nestjs/common';
import * as ffmpegCore from 'fluent-ffmpeg';
import { unlink } from 'fs/promises';
import { FORMAT } from 'src/constants/video-formats';

@Injectable()
export class FfmpegService {
    constructor(@Inject('FFMPEG') private readonly ffmpeg: typeof ffmpegCore) {}

    async mergeAudioVideo(
        audio: string,
        video: string,
        output: string
    ): Promise<void> {
        const ffdl = this.ffmpeg();
        ffdl.addInput(audio) // audio
            .addInput(video) // video
            .format(FORMAT.MP4) // format
            .videoCodec('libx264') // códec video H.264
            .saveToFile(output); // output file

        await new Promise((resolve, reject) => {
            ffdl.on('error', (error) => {
                reject(error);
            });

            ffdl.on('end', async () => {
                await unlink(audio);
                await unlink(video);
                resolve('END');
            });
        });
    }
}
