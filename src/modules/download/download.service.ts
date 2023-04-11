import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream } from 'fs';
import miniget from 'miniget';
import { FORMAT } from 'src/constants/video-formats';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { pipeline } from 'stream/promises';
import { CompressorService } from '../compressor/compressor.service';
import { YoutubeDlService } from '../youtube-dl/youtubedl.service';

@Injectable()
export class DownloadService {
    private readonly logger = new Logger();
    private readonly folder = OUTPUT_PATH;

    constructor(
        private readonly downloadGateway: DownloadGateway,
        private readonly youtubeDlService: YoutubeDlService,
        private readonly compressorService: CompressorService,
        private readonly googleService: GoogleapiService
    ) {}

    public async downloadVideo(
        videoId: string,
        videoInfo: IVideoInfo,
        clientId: string
    ) {
        try {
            const { channelTitle, channelId, title } = videoInfo;

            const fileName = `${title}_${videoId}.${FORMAT.MP4}`;
            const channelName = `${channelTitle}_${channelId}`;

            const file = await this.youtubeDlService.downloadVideo(
                videoId,
                fileName,
                channelName,
                clientId
            );

            return file;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    public async downloadVideos(
        videoIds: string[],
        channelName: string,
        clientId: string
    ) {
        try {
            const channelFolder = `${this.folder}/${channelName}`;

            for (const videoId of videoIds) {
                await this.downloadVideo(
                    videoId,
                    await this.googleService.getVideoInfo(videoId),
                    clientId
                );
            }

            const outputZip = await this.compressorService.compressFolder(
                channelFolder,
                channelName,
                OUTPUT_PATH,
                clientId
            );

            return { channelFolder, outputZip };
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    public async downloadImage(imgUrl: string, dest: string) {
        const url = imgUrl.replace(/=s\d+/, '=s1080');
        const img = await miniget(url);
        const out = createWriteStream(dest);
        await pipeline([img, out]);
        return dest;
    }
}
