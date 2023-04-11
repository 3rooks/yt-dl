import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { CONFIG } from 'src/constants/config';
import { DOWNLOAD_PROGRESS } from 'src/constants/regex.s';
import { FORMAT } from 'src/constants/video-formats';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { chunkArray } from 'src/utils/chunk-arr';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { exec } from 'youtube-dl-exec';

@Injectable()
export class YoutubeDlService {
    private readonly logger = new Logger();
    private readonly folder = OUTPUT_PATH;

    constructor(
        @Inject('YTDLEXEC') private readonly youtubeDl: typeof exec,
        private readonly downloadGateway: DownloadGateway,
        private readonly configService: ConfigService
    ) {}

    async downloadVideo(
        videoId: string,
        fileName: string,
        channelName: string,
        clientId: string
    ) {
        try {
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const outputFolder = join(this.folder, channelName);

            if (!existsSync(outputFolder))
                await mkdir(outputFolder, { recursive: true });

            const outputFile = join(outputFolder, fileName);

            const result = this.youtubeDl(videoUrl, {
                output: `${outputFile}`,
                format: 'best',
                username: this.configService.get<string>(CONFIG.YT_EMAIL),
                password: this.configService.get<string>(CONFIG.YT_PASSWORD),
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            });

            result.stdout.on('data', (data: Buffer) => {
                const strData = data.toString();
                const downloadMatch = strData.match(DOWNLOAD_PROGRESS);
                const payload = downloadMatch && downloadMatch[0];
                this.downloadGateway.downloadProgress(clientId, payload);
            });

            result.on('exit', () => {
                this.downloadGateway.downloadFinished(clientId, 'Finished');
            });

            await result;
            return { outputFile, outputFolder };
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    async downloadChannel(
        videoIds: string[],
        channelName: string,
        clientId: string
    ) {
        try {
            const batches = chunkArray(videoIds, 5);

            let progressVideos = 0;
            const totalVideos = videoIds.length;

            for (const batch of batches) {
                const downloadPromises = batch.map(async (videoId: string) => {
                    try {
                        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                        if (!existsSync(channelName)) {
                            await mkdir(channelName, { recursive: true });
                        }

                        await this.youtubeDl(videoUrl, {
                            output: `${channelName}/%(title)s_${videoId}.${FORMAT.MP4}`,
                            format: 'best',
                            username: this.configService.get<string>(
                                CONFIG.YT_EMAIL
                            ),
                            password: this.configService.get<string>(
                                CONFIG.YT_PASSWORD
                            ),
                            addHeader: [
                                'referer:youtube.com',
                                'user-agent:googlebot'
                            ],
                            noPlaylist: true
                        });

                        progressVideos++;

                        this.downloadGateway.downloadVideosChannel(clientId, {
                            progressVideos,
                            totalVideos
                        });

                        this.logger.log(
                            `Video ${videoId} downloaded successfully`
                        );
                    } catch (error) {
                        this.logger.error(
                            `Error downloading video ${videoId}:`,
                            error
                        );
                    }
                });

                // Esperar a que se completen todas las descargas del lote antes de pasar al siguiente
                await Promise.all([...downloadPromises]);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
