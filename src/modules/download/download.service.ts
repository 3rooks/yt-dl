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
import { YtsrService } from '../ytsr/ytsr.service';
import { Download, DownloadDocument } from './schema/download.schema';

@Injectable()
export class DownloadService {
    constructor(
        @InjectModel(Download.name)
        private readonly downloadModel: Model<DownloadDocument>,
        private readonly ffmpegService: FfmpegService,
        private readonly ytdlService: YtdlService,
        private readonly ytsrService: YtsrService
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
        outputFolder: string
    ): Promise<string> {
        const { videoId } = videoInfo;

        const { outputAudio, outputVideo, outputFile } =
            await outputAudioVideoFilePath(videoInfo, outputFolder);

        if (await fileExists(outputFile)) return outputFile;

        await this.ytdlService.donwloadAudioVideo(
            videoId,
            outputAudio,
            outputVideo
        );

        await this.ffmpegService.mergeAudioVideo(
            outputAudio,
            outputVideo,
            outputFile
        );

        console.log(`Finished => ${videoInfo.title}`);
        return outputFile;
    }

    public async downloadVideos(
        videoInfos: IVideoInfo[],
        outputFolder: string
    ): Promise<Downloads[]> {
        const videoPromises = videoInfos.map(async (videoInfo) => {
            const output = await this.downloadVideo(videoInfo, outputFolder);

            const newDownload: Downloads = {
                videoId: videoInfo.videoId,
                filePath: output,
                videoInfo
            };

            return newDownload;
        });

        return await Promise.all([...videoPromises]);
    }

    async funciona(searches: string[]) {
        const videoIds: string[] = [];
        for (const search of searches) {
            const url = await this.ytsrService.getLastHourUrl(search);
            const videos = await this.ytsrService.getVideosFiltered(url);
            if (!videos.length) continue;
            const idsids = videos.map((video) => video.id);
            videoIds.push(...idsids);
        }
        return videoIds;
    }

    public async getLastHourVideoIds(searches: string[]): Promise<string[]> {
        const urls = [];

        const ids: string[] = [];

        for (const url of urls) {
            const videoIds = await this.ytsrService.getVideosFiltered(url);
            if (!videoIds) continue;
            // ids.push(...videoIds);
        }

        return ids;
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
