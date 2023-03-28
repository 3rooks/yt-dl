import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { CONFIG } from 'src/constants/config';
import { Exception } from 'src/utils/error/exception-handler';
import { pipeline } from 'stream/promises';
import * as ytdlCore from 'ytdl-core';

@Injectable()
export class YtdlService {
    constructor(
        @Inject('YTDL') private readonly ytdl: typeof ytdlCore,
        private readonly config: ConfigService
    ) {}

    async donwloadAudioVideo(
        videoId: string,
        outputAudio: string,
        outputVideo: string
    ): Promise<void> {
        try {
            const audioWriteable = createWriteStream(outputAudio);
            const audioReadable = this.ytdl(videoId, {
                filter: 'audioonly',
                quality: 'highestaudio',
                requestOptions: {
                    headers: {
                        cookie: this.config.get<string>(CONFIG.YT_COOKIE)
                    }
                }
            });

            const videoWriteable = createWriteStream(outputVideo);
            const videoReadable = this.ytdl(videoId, {
                filter: 'videoonly',
                quality: 'highestvideo',
                requestOptions: {
                    headers: {
                        cookie: this.config.get<string>(CONFIG.YT_COOKIE)
                    }
                }
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
