import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { CONFIG } from 'src/constants/config';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import {
    getBestAudioFormat,
    getBestVideoFormat
} from 'src/utils/dl-fn/get-best-quality';
import { Exception } from 'src/utils/error/exception-handler';
import { pipeline } from 'stream/promises';
import * as ytdlCore from 'ytdl-core';

@Injectable()
export class YtdlService {
    constructor(
        @Inject('YTDL') private readonly ytdl: typeof ytdlCore,
        private readonly config: ConfigService,
        private readonly downloadGateway: DownloadGateway
    ) {}

    async getBestQualityAudioVideo(videoId: string) {
        try {
            const requestOptions = {
                headers: {
                    cookie: this.config.get<string>(CONFIG.YT_COOKIE)
                }
            };

            const { formats } = await this.ytdl.getInfo(videoId, {
                requestOptions
            });

            const bestAudio = await getBestAudioFormat(formats);
            const bestVideo = await getBestVideoFormat(formats);

            return { bestAudio, bestVideo };
        } catch (error) {
            console.log(error.message);
        }
    }

    async downloadAudioVideo(
        videoId: string,
        bestAudio: ytdlCore.videoFormat,
        bestVideo: ytdlCore.videoFormat,
        outputAudio: string,
        outputVideo: string,
        clientId: string
    ): Promise<void> {
        try {
            const requestOptions = {
                headers: {
                    cookie: this.config.get<string>(CONFIG.YT_COOKIE)
                }
            };

            const audioWriteable = createWriteStream(outputAudio);
            const audioReadable = this.ytdl(videoId, {
                filter: 'audioonly',
                quality: bestAudio.itag,
                requestOptions
            });

            const videoWriteable = createWriteStream(outputVideo);
            const videoReadable = this.ytdl(videoId, {
                filter: 'videoonly',
                quality: bestVideo.itag,
                requestOptions
            });

            await Promise.all([
                pipeline([audioReadable, audioWriteable]),
                pipeline([videoReadable, videoWriteable])
            ]);

            this.downloadGateway.downloadFinished(clientId, 'Downloaded');
        } catch (error) {
            await unlink(outputAudio);
            await unlink(outputVideo);
            throw Exception.catch(error.message);
        }
    }
}
