import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { CONFIG } from 'src/constants/config';
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
        private readonly config: ConfigService
    ) {}

    async getBestQualityAudioVideo(videoId: string) {
        const requestOptions = {
            headers: {
                cookie: this.config.get<string>(CONFIG.YT_COOKIE)
            }
        };

        const { formats } = await this.ytdl.getInfo(videoId, {
            requestOptions
        });

        const bestAudio = getBestAudioFormat(formats);
        const bestVideo = getBestVideoFormat(formats);

        return { bestAudio, bestVideo };
    }

    async downloadAudioVideo(
        videoId: string,
        bestAudio: ytdlCore.videoFormat,
        bestVideo: ytdlCore.videoFormat,
        outputAudio: string,
        outputVideo: string
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
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}
