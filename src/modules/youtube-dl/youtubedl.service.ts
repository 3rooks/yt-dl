import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExecaChildProcess } from 'execa';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { CONFIG } from 'src/constants/config';
import { DOWNLOAD_PROGRESS } from 'src/constants/regex.s';
import { FORMAT } from 'src/constants/video-formats';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { exec } from 'youtube-dl-exec';

@Injectable()
export class YoutubeDlService {
    private readonly folder = OUTPUT_PATH;
    private readonly format = 'best';

    constructor(
        @Inject('YTDLEXEC') private readonly youtubeDl: typeof exec,
        private readonly downloadGateway: DownloadGateway,
        private readonly configService: ConfigService
    ) {}

    public async downloadVideo(
        videoId: string,
        videoInfo: IVideoInfo,
        clientId: string
    ) {
        try {
            const { filePath, folderPath } = await this.paths(videoInfo);

            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            const youtubeDl = this.youtubeDl(videoUrl, {
                output: filePath,
                format: this.format,
                username: this.configService.get<string>(CONFIG.YT_EMAIL),
                password: this.configService.get<string>(CONFIG.YT_PASSWORD),
                addHeader: ['referer:youtube.com', 'user-agent:googlebot']
            });

            this.progress(clientId, youtubeDl);

            await youtubeDl;

            return { filePath, folderPath };
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    private async paths(videoInfo: IVideoInfo) {
        const { channelTitle, channelId, title, videoId } = videoInfo;

        const channelTemplate = `${channelTitle}_${channelId}`;
        const fileTemplate = `${title}_${videoId}.${FORMAT.MP4}`;

        const folderPath = join(this.folder, channelTemplate);

        if (!existsSync(folderPath))
            await mkdir(folderPath, { recursive: true });

        const filePath = join(folderPath, fileTemplate);

        return { filePath, folderPath };
    }

    private progress(clientId: string, youtubeDl: ExecaChildProcess) {
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
}
