import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream } from 'fs';
import miniget from 'miniget';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
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
        private readonly compressorService: CompressorService
    ) {}

    public async downloadVideo(
        videoId: string,
        videoInfo: IVideoInfo,
        clientId: string
    ) {
        try {
            const outputs = await this.youtubeDlService.downloadVideo(
                videoId,
                videoInfo,
                clientId
            );

            this.logger.log(`Downloaded: ${videoId}`);

            return outputs;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    public async downloadChannel(
        videoIds: string[],
        googleService: GoogleapiService,
        clientId: string
    ) {
        try {
            const totalVideos = videoIds.length;
            let channelFolder = '';
            let progress = 0;

            for (const videoId of videoIds) {
                const videoInfo = await googleService.getVideoInfo(videoId);

                if (!videoInfo) continue;

                progress++;
                const { folderPath } = await this.downloadVideo(
                    videoId,
                    videoInfo,
                    clientId
                );

                this.downloadGateway.downloadVideosChannel(clientId, {
                    progressVideos: progress,
                    totalVideos
                });

                channelFolder = folderPath;
            }

            return channelFolder;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    public async downloadImage(channelInfo: IChannelInfo) {
        const { channelId, thumbnails } = channelInfo;

        const imgUrl = thumbnails.high.url.replace(/=s\d+/, '=s1080');
        const imgStream = await miniget(imgUrl);

        const imgTemplate = `${channelId}.${FORMAT.JPG}`;
        const outputPath = join(this.folder, imgTemplate);

        const outStream = createWriteStream(outputPath);

        await pipeline([imgStream, outStream]);

        return outputPath;
    }

    public async compression(
        channelInfo: IChannelInfo,
        folder: string,
        clientId: string
    ) {
        return await this.compressorService.compressFolder(
            channelInfo,
            folder,
            clientId
        );
    }
}
