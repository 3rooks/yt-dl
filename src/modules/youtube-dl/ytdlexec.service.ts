import { Inject, Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { exec } from 'youtube-dl-exec';

@Injectable()
export class YoutubeDlService {
    private readonly logger = new Logger();
    private readonly folder = OUTPUT_PATH;

    constructor(
        @Inject('YTDLEXEC') private readonly youtubeDl: typeof exec,
        private readonly downloadGateway: DownloadGateway
    ) {}

    async downloadVideo(
        videoId: string,
        fileName: string,
        channelName: string,
        clientId: string
    ) {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const outputFolder = join(this.folder, channelName);

        if (!existsSync(outputFolder))
            await mkdir(outputFolder, { recursive: true });

        const outputFile = join(outputFolder, fileName);

        const result = this.youtubeDl(videoUrl, {
            output: `${outputFile}`,
            format: 'best',
            username: '3oris101@gmail.com',
            password: 'e26dfd1998',
            addHeader: ['referer:youtube.com', 'user-agent:googlebot']
        });

        result.stdout.on('data', (data: Buffer) => {
            const strData = data.toString();

            const downloadRegex =
                /\[download\]\s+\d{1,3}\.\d%\sof\s+\d+\.\d+\w+\sat\s+\d+\.\d+\w+\/s\s+ETA\s+\d+:\d{2}/;
            const downloadMatch = strData.match(downloadRegex);

            this.downloadGateway.downloadProgress(
                clientId,
                downloadMatch && downloadMatch[0]
            );
        });

        result.on('exit', () => {
            this.downloadGateway.downloadFinished(clientId, 'Finished');
        });

        await result;
        return { outputFile, outputFolder };
    }

    async downloadChannel(
        videoIds: string[],
        channelFolder: string,
        clientId: string
    ) {
        let progressVideos = 0;
        const totalVideos = videoIds.length;

        for (const videoId of videoIds) {
            try {
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                await this.youtubeDl(videoUrl, {
                    output: `${channelFolder}/%(title)s_${videoId}.${FORMAT.MP4}`,
                    format: 'bestvideo+bestaudio/best',
                    username: '3oris101@gmail.com',
                    password: 'e26dfd1998',
                    addHeader: ['referer:youtube.com', 'user-agent:googlebot']
                });

                progressVideos++;
                const progressPayload = {
                    progressVideos,
                    totalVideos
                };

                this.downloadGateway.downloadVideosChannel(
                    clientId,
                    progressPayload
                );

                this.logger.log(`Video ${videoId} downloaded successfully`);
            } catch (error) {
                this.logger.error(`Error downloading video ${videoId}:`, error);
            }
        }
    }
}
