import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import * as miniget from 'miniget';
import { Model } from 'mongoose';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { Downloads, IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';
import { fileExists } from 'src/utils/file-exists';
import { outputAudioVideoFilePath } from 'src/utils/ytdl-paths';
import { pipeline } from 'stream/promises';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
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
        private readonly downloadGateway: DownloadGateway
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
            console.log('DOWNLOADVIDEO',error);
            throw Exception.catch(error.message);
        }
    }

    public async downloadVideos(
        videoInfos: IVideoInfo[],
        outputFolder: string,
        clientId: string
    ) {
        try {
            let progressVideos = 0;
            const totalVideos = videoInfos.length;

            const videoPromises = videoInfos.map(async (videoInfo) => {
                const { outputPath } = await this.downloadVideo(
                    videoInfo,
                    outputFolder,
                    clientId
                );
                progressVideos++;
                const progressPayload = {
                    progressVideos,
                    totalVideos
                };

                this.downloadGateway.downloadVideosChannel(
                    clientId,
                    progressPayload
                );

                return outputPath;
            });

            const results = await Promise.all([...videoPromises]);

            return results[0];
        } catch (error) {
            console.log('VIDEOSSSS',error);
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
