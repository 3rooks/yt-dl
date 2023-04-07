import { Inject, Injectable } from '@nestjs/common';
import * as ffmpegCore from 'fluent-ffmpeg';
import { unlink } from 'fs/promises';
import { FORMAT } from 'src/constants/video-formats';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';

@Injectable()
export class FfmpegService {
    constructor(
        @Inject('FFMPEG') private readonly ffmpeg: typeof ffmpegCore,
        private readonly downloadGateway: DownloadGateway
    ) {}

    async mergeAudioVideo(
        audio: string,
        video: string,
        output: string,
        clientId: string
    ): Promise<void> {
        try {
            const ffdl = this.ffmpeg();
            ffdl.addInput(audio) // audio
                .addInput(video) // video
                .format(FORMAT.MP4) // format
                .videoCodec('libx264') // códec video H.264
                .saveToFile(output); // output file

            ffdl.on('progress', (progress) => {
                const progressData = {
                    frames: progress.frames,
                    fps: progress.currentFps,
                    kbps: progress.currentKbps,
                    size: progress.targetSize,
                    time: progress.timemark
                };

                // console.log(progressData);
                this.downloadGateway.mergeProgress(clientId, progressData);
            });

            await new Promise((resolve, reject) => {
                ffdl.on('error', (error) => {
                    reject(error);
                });

                ffdl.on('end', async () => {
                    await unlink(audio);
                    await unlink(video);
                    this.downloadGateway.mergeFinished(clientId, 'END');
                    resolve('END');
                });
            });
        } catch (error) {
            console.log(error.message);
        }
    }
}
