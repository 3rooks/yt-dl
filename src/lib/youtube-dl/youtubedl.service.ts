import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExecaChildProcess } from 'execa';
import { constants, createWriteStream } from 'fs';
import { access } from 'fs/promises';
import Miniget from 'miniget';
import { join } from 'path';
import { CONFIG } from 'src/constants/config';
import { DOWNLOAD_PROGRESS } from 'src/constants/regex.s';
import { Formats } from 'src/constants/video-formats';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { chunkArray } from 'src/utils/chunk-arr';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { pipeline } from 'stream/promises';
import { exec } from 'youtube-dl-exec';
import { GoogleapiService } from '../googleapis/googleapis.service';

const { YT_EMAIL, YT_PASSWORD } = CONFIG;

@Injectable()
export class YoutubeDlService {
    private readonly logger = new Logger();
    private readonly folder = OUTPUT_PATH;
    private readonly format = 'best';
    private readonly username = this.configService.get<string>(YT_EMAIL);
    private readonly password = this.configService.get<string>(YT_PASSWORD);
    private readonly template = `%(channel_id)s/%(uploader)s/%(title)s_%(id)s.%(ext)s`;

    constructor(
        @Inject('YTDLEXEC') private readonly youtubeDl: typeof exec,
        private readonly downloadGateway: DownloadGateway,
        private readonly configService: ConfigService,
        private readonly googleService: GoogleapiService
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

    async dLocalVideo(videoId: string): Promise<boolean> {
        try {
            const exist = await this.existVideo(
                await this.googleService.getVideoInfo(videoId)
            );

            if (exist) {
                this.logger.log(`VIDEO_EXISTS: ${videoId}`);
                return false;
            }

            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            await this.youtubeDl(videoUrl, {
                output: `${this.folder}/${this.template}`,
                format: this.format,
                username: this.username,
                password: this.password,
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            });

            this.logger.log(`VIDEO_DOWNLOADED: ${videoId}`);
            return true;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    async dLocalChannel(channelId: string) {
        try {
            const videoIds = await this.googleService.getAllVideosFromChannel(
                channelId
            );

            this.logger.log(`DOWNLOADING: ${videoIds.length}`);

            const chunks = chunkArray(videoIds, 5);

            for (const chunk of chunks) {
                const downloadPromises = chunk.map(
                    async (videoId: string) => await this.dLocalVideo(videoId)
                );
                await Promise.all([...downloadPromises]);
            }

            return videoIds.length;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    async dLocalImage(channelId: string) {
        const channelInfo = await this.googleService.getChannelInfo(channelId);

        const imgUrl = channelInfo.thumbnails.high.url.replace(
            /=s\d+/,
            '=s1080'
        );

        const imgStream = await Miniget(imgUrl);

        const imgTemplate = `${channelId}_${Date.now()}.${Formats.JPG}`;
        const outputPath = join(this.folder, channelId, imgTemplate);

        const outStream = createWriteStream(outputPath);
        await pipeline([imgStream, outStream]);

        return imgTemplate;
    }

    private async existVideo(videoInfo: IVideoInfo) {
        const { channelTitle, channelId, title, videoId } = videoInfo;

        const videoName = `${title}_${videoId}`;

        const folderPath = join(this.folder, channelId, channelTitle);
        const filePath = join(folderPath, `${videoName}.${Formats.MP4}`);

        return await this.fileExists(filePath);
    }

    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await access(filePath, constants.F_OK);
            return true;
        } catch (error) {
            return false;
        }
    }
}
