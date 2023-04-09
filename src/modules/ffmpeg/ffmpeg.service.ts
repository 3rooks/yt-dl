import { Inject, Injectable } from '@nestjs/common';
import * as ffmpegCore from 'fluent-ffmpeg';
import { unlink } from 'fs/promises';
import { FORMAT } from 'src/constants/video-formats';
import {
    FfmpegProgress,
    MergeProgress
} from 'src/interfaces/merge-progress.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';

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
                .on('progress', (progress) => handleProgress(progress))
                .saveToFile(output); // output file

            const handleProgress = (progress: FfmpegProgress) => {
                const progressData: MergeProgress = {
                    frames: progress.frames,
                    fps: progress.currentFps,
                    kbps: progress.currentKbps,
                    size: progress.targetSize,
                    time: progress.timemark
                };
                this.downloadGateway.mergeProgress(clientId, progressData);
            };

            await new Promise((resolve, reject) => {
                ffdl.on('error', async (error) => {
                    await unlink(output);
                    reject(error);
                });

                ffdl.on('end', async () => {
                    await unlink(audio);
                    await unlink(video);
                    this.downloadGateway.mergeFinished(clientId, 'Finished');
                    resolve('Finished');
                });
            });
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}
