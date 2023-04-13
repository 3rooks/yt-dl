import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import miniget from 'miniget';
import { join } from 'path';
import { FORMATS } from 'src/constants/video-formats';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { pipeline } from 'stream/promises';
import { Exception } from '../../utils/error/exception-handler';
import { CompressorService } from '../compressor/compressor.service';
import { YoutubeDlService } from '../youtube-dl/youtubedl.service';

@Injectable()
export class DownloadService {
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
            const paths = this.pathsVideoInfo(videoInfo, output);

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

    private pathsVideoInfo = (videoInfo: IVideoInfo, output: string) => {
        const { channelTitle, channelId, title, videoId } = videoInfo;

        const videoName = `${title}_${videoId}`;
        const folderName = `${channelTitle}_${channelId}`;

        const folderPath = join(output, folderName);
        const filePath = join(folderPath, `${videoName}.${FORMATS.MP4}`);

        return { videoName, folderName, filePath, folderPath };
    };

    public async downloadChannel(
        videoIds: string[],
        channelInfo: IChannelInfo,
        output: string,
        clientId: string
    ) {
        try {
            const paths = this.pathsChannelInfo(channelInfo, output);

            await this.youtubeDlService.downloadChannel(videoIds, clientId);

            await this.compressorService.compressFolder(
                paths.filePath,
                paths.folderPath,
                clientId
            );

            return paths;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    private pathsChannelInfo(channelInfo: IChannelInfo, output: string) {
        const { name, channelId } = channelInfo;

        const folderName = `${name}_${channelId}`;
        const fileName = `${folderName}.${FORMATS.ZIP}`;

        const folderPath = join(output, folderName);
        const filePath = join(output, fileName);

        return { folderName, fileName, folderPath, filePath };
    }

    public async downloadImage(channelInfo: IChannelInfo, output: string) {
        const { channelId, thumbnails } = channelInfo;

        const imgUrl = thumbnails.high.url.replace(/=s\d+/, '=s1080');
        const imgStream = await miniget(imgUrl);

        const imgTemplate = `${channelId}.${FORMATS.JPG}`;
        const outputPath = join(output, imgTemplate);

        const outStream = createWriteStream(outputPath);

        await pipeline([imgStream, outStream]);

        return outputPath;
    }
}
