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

const socket: any = '';

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

            // Inicializar la variable para llevar el registro del progreso actual
            let downloadedBytes = 0;
            const totalSize =
                Number(bestAudio.contentLength) +
                Number(bestVideo.contentLength);

            // Escuchar el evento 'progress' de la descarga de audio y enviar el progreso actual
            audioReadable.on('data', (chunk: any) => {
                downloadedBytes += chunk.length;
                sendProgress(downloadedBytes);
            });

            // Escuchar el evento 'progress' de la descarga de video y enviar el progreso actual
            videoReadable.on('data', (chunk: any) => {
                downloadedBytes += chunk.length;
                sendProgress(downloadedBytes);
            });

            // Enviar la información del progreso al cliente
            const sendProgress = (downloadedBytes: number) => {
                socket.emit('downloadProgress', {
                    progress: downloadedBytes / totalSize,
                    downloadedBytes,
                    totalSize
                });
            };

            await Promise.all([
                pipeline([audioReadable, audioWriteable]),
                pipeline([videoReadable, videoWriteable])
            ]);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}


// const fs = require('fs');

// const totalSize = fs.statSync(filePath).size;
