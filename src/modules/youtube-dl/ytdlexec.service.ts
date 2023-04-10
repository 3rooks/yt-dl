import { Inject, Injectable, Logger } from '@nestjs/common';
import { FORMAT } from 'src/constants/video-formats';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { exec } from 'youtube-dl-exec';

@Injectable()
export class YoutubeDlService {
    private readonly logger = new Logger();

    constructor(
        @Inject('YTDLEXEC') private readonly youtubeDl: typeof exec,
        private readonly downloadGateway: DownloadGateway
    ) {}

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
