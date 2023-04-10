import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createWriteStream, existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import * as miniget from 'miniget';
import { Model } from 'mongoose';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { Downloads, IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';
import { fileExists } from 'src/utils/file-exists';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { outputAudioVideoFilePath } from 'src/utils/ytdl-paths';
import { pipeline } from 'stream/promises';
import { CompressorService } from '../compressor/compressor.service';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
import { YoutubeDlService } from '../youtube-dl/ytdlexec.service';
import { YtdlService } from '../ytdl/ytdl.service';
import { Download, DownloadDocument } from './schema/download.schema';

@Injectable()
export class DownloadService {
    private logger = new Logger();

    constructor(
        @InjectModel(Download.name)
        private readonly downloadModel: Model<DownloadDocument>,
        private readonly ffmpegService: FfmpegService,
        private readonly ytdlService: YtdlService,
        private readonly downloadGateway: DownloadGateway,
        private readonly youtubeDlService: YoutubeDlService,
        private readonly compressorService: CompressorService
    ) {}

    public async create(data: Download): Promise<DownloadDocument> {
        return await new this.downloadModel(data).save();
    }

    public async getById(channelId: string): Promise<DownloadDocument> {
        return await this.downloadModel.findOne({ id: channelId }).exec();
    }

    public async updateById(
        id: string,
        data: object
    ): Promise<DownloadDocument> {
        return await this.downloadModel.findByIdAndUpdate(id, data);
    }

    public async updatedDownloadsById(
        id: string,
        downloads: Downloads[]
    ): Promise<DownloadDocument> {
        return await this.downloadModel.findByIdAndUpdate(
            id,
            { downloads },
            { new: true }
        );
    }

    public async getVideoFileById(videoId: string): Promise<DownloadDocument> {
        return await this.downloadModel.findOne(
            { 'downloads.videoId': videoId },
            { 'downloads.$': 1, _id: 0 }
        );
    }

    public async downloadVideo(
        videoInfo: IVideoInfo,
        outputFolder: string,
        clientId: string
    ): Promise<{
        outputPath: string;
        outputFile: string;
    }> {
        try {
            const { videoId } = videoInfo;

            const { outputPath, outputAudio, outputVideo, outputFile } =
                await outputAudioVideoFilePath(videoInfo, outputFolder);

            if (await fileExists(outputFile)) return { outputPath, outputFile };

            const { bestAudio, bestVideo } =
                await this.ytdlService.getBestQualityAudioVideo(videoId);

            await this.ytdlService.downloadAudioVideo(
                videoId,
                bestAudio,
                bestVideo,
                outputAudio,
                outputVideo,
                clientId
            );

            await this.ffmpegService.mergeAudioVideo(
                outputAudio,
                outputVideo,
                outputFile,
                clientId
            );

            this.logger.log(`Downloaded => ${videoInfo.title}`);

            return { outputPath, outputFile };
        } catch (error) {
            console.log('DOWNLOADVIDEO', error);
            throw Exception.catch(error.message);
        }
    }

    public async downloadVideos(
        videoIds: string[],
        channel: string,
        clientId: string
    ) {
        try {
            const channelFolder = `${OUTPUT_PATH}/${channel}`;

            if (!existsSync(channelFolder))
                await mkdir(channelFolder, { recursive: true });

            await this.youtubeDlService.downloadChannel(
                videoIds,
                channelFolder,
                clientId
            );

            const outputZip = await this.compressorService.compressFolder(
                channelFolder,
                channel,
                OUTPUT_PATH,
                clientId
            );

            return { channelFolder, outputZip };
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    public async downloadTextAndImage(
        imgUrl: string,
        outputImg: string,
        channelInfo: IChannelInfo,
        outputText: string
    ): Promise<void> {
        await this.downloadImage(imgUrl, outputImg);
        await this.downloadText(channelInfo, outputText);
    }

    private async downloadImage(imgUrl: string, dest: string): Promise<void> {
        const url = imgUrl.replace(/=s\d+/, '=s1080');
        const img = await miniget(url);
        const out = createWriteStream(dest);
        await pipeline([img, out]);
    }

    private async downloadText(
        data: IChannelInfo,
        output: string
    ): Promise<void> {
        await writeFile(output, JSON.stringify(data, null, 4), 'utf-8');
    }
}
