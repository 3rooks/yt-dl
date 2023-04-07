import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import * as miniget from 'miniget';
import { Model } from 'mongoose';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { Downloads, IVideoInfo } from 'src/interfaces/downloads.interface';
import { fileExists } from 'src/utils/file-exists';
import { outputAudioVideoFilePath } from 'src/utils/ytdl-paths';
import { pipeline } from 'stream/promises';
import { FfmpegService } from '../ffmpeg/ffmpeg.service';
import { YtdlService } from '../ytdl/ytdl.service';
import { Download, DownloadDocument } from './schema/download.schema';

@Injectable()
export class DownloadService {
    constructor(
        @InjectModel(Download.name)
        private readonly downloadModel: Model<DownloadDocument>,
        private readonly ffmpegService: FfmpegService,
        private readonly ytdlService: YtdlService
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
    ): Promise<string> {
        try {
            const { videoId } = videoInfo;

            const { outputAudio, outputVideo, outputFile } =
                await outputAudioVideoFilePath(videoInfo, outputFolder);

            if (await fileExists(outputFile)) return outputFile;

            console.log('ANTES DE BEST');
            const besties = await this.ytdlService.getBestQualityAudioVideo(
                videoId
            );

            if (!besties || !besties.bestAudio || !besties.bestVideo) {
                console.log('No se encontró la mejor calidad de audio y video');
                return null;
            }
            console.log('BEST', besties);

            await this.ytdlService.downloadAudioVideo(
                videoId,
                besties.bestAudio,
                besties.bestVideo,
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

            console.log(`Finished => ${videoInfo.title}`);
            return outputFile;
        } catch (error) {
            console.log(error.message + error.stack);
        }
    }

    public async downloadVideos(
        videoInfos: IVideoInfo[],
        outputFolder: string
    ): Promise<Downloads[]> {
        const videoPromises = videoInfos.map(async (videoInfo) => {
            // const output = await this.downloadVideo(videoInfo, outputFolder);

            const newDownload: Downloads = {
                videoId: videoInfo.videoId,
                filePath: '',
                videoInfo
            };

            return newDownload;
        });

        return await Promise.all([...videoPromises]);
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
