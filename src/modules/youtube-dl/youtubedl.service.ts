import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExecaChildProcess } from 'execa';
import { CONFIG } from 'src/constants/config';
import { DOWNLOAD_PROGRESS } from 'src/constants/regex.s';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { chunkArray } from 'src/utils/chunk-arr';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { exec } from 'youtube-dl-exec';

const { YT_EMAIL, YT_PASSWORD } = CONFIG;

@Injectable()
export class YoutubeDlService {
    private readonly logger = new Logger();
    private readonly folder = OUTPUT_PATH;
    private readonly format = 'best';
    private readonly username = this.configService.get<string>(YT_EMAIL);
    private readonly password = this.configService.get<string>(YT_PASSWORD);
    private readonly template = `%(uploader)s_%(channel_id)s/%(title)s_%(id)s.%(ext)s`;

    constructor(
        @Inject('YTDLEXEC') private readonly youtubeDl: typeof exec,
        private readonly downloadGateway: DownloadGateway,
        private readonly configService: ConfigService
    ) {}

    public async downloadVideo(
        videoId: string,
        output: string,
        clientId: string
    ): Promise<void> {
        try {
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            const youtubeDl = this.youtubeDl(videoUrl, {
                output: `${output}/${this.template}`,
                format: this.format,
                username: this.username,
                password: this.password,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            });

            this.progress(clientId, youtubeDl);

            await youtubeDl;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    private progress(clientId: string, youtubeDl: ExecaChildProcess): void {
        youtubeDl.stdout.on('data', (data: Buffer) => {
            const strData = data.toString();
            const downloadMatch = strData.match(DOWNLOAD_PROGRESS);
            const payload = downloadMatch && downloadMatch[0];
            this.downloadGateway.downloadProgress(clientId, payload);
        });

        youtubeDl.on('exit', () => {
            this.downloadGateway.downloadFinished(clientId);
        });
    }

    async downloadChannel(videoIds: string[], clientId: string): Promise<void> {
        try {
            const chunks = chunkArray(videoIds, 5);
            const totalVideos = videoIds.length;
            let progressVideos = 0;

            for (const chunk of chunks) {
                const downloadPromises = chunk.map(async (videoId: string) => {
                    try {
                        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                        await this.youtubeDl(videoUrl, {
                            output: `${this.folder}/${this.template}`,
                            format: this.format,
                            username: this.username,
                            password: this.password,
                            addHeader: [
                                'referer:youtube.com',
                                'user-agent:googlebot'
                            ]
                        });

                        progressVideos++;

                        this.downloadGateway.downloadVideosChannel(clientId, {
                            progressVideos,
                            totalVideos
                        });

                        this.logger.log(`Downloaded: ${videoId}`);
                    } catch (error) {
                        this.logger.error(`Error: ${videoId}-${error.message}`);
                    }
                });

                await Promise.all([...downloadPromises]);
            }
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}
