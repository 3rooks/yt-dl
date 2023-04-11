import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import miniget from 'miniget';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { pipeline } from 'stream/promises';
import { CompressorService } from '../compressor/compressor.service';
import { YoutubeDlService } from '../youtube-dl/youtubedl.service';

@Injectable()
export class DownloadService {
    private readonly folder = OUTPUT_PATH;

    constructor(
        private readonly youtubeDlService: YoutubeDlService,
        private readonly compressorService: CompressorService
    ) {}

    public async downloadVideo(
        videoId: string,
        videoInfo: IVideoInfo,
        output: string,
        clientId: string
    ) {
        try {
            const paths = this.paths(videoInfo, output);

            await this.youtubeDlService.downloadVideo(
                videoId,
                output,
                clientId
            );

            return paths;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    private paths = (videoInfo: IVideoInfo, output: string) => {
        const { channelTitle, channelId, title, videoId } = videoInfo;

        const videoName = `${title}_${videoId}`;
        const folderName = `${channelTitle}_${channelId}`;

        const folderPath = join(output, folderName);
        const filePath = join(folderPath, videoName);

        return { videoName, folderName, filePath, folderPath };
    };

    public async downloadChannel(
        videoIds: string[],
        folderTo: string,
        clientId: string
    ) {
        try {
            await this.youtubeDlService.downloadChannel(videoIds, clientId);
            return await this.compressorService.compressFolder(
                folderTo,
                clientId
            );
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
}
