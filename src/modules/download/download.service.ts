import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as ffmpegCore from 'fluent-ffmpeg';
import { createWriteStream } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import * as imgdlCore from 'image-downloader';
import { Model } from 'mongoose';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { Downloads, IVideoInfo } from 'src/interfaces/downloads.interface';
import { Exception } from 'src/utils/error/exception-handler';
import { fileExists } from 'src/utils/file-exists';
import { OUTPUT_PATH, RANDOM_PATH } from 'src/utils/paths.resource';
import {
    outputAudioVideoFilePath,
    outputAudioVideoFilePathRandom,
    outputTextImagePath
} from 'src/utils/ytdl-paths';
import { pipeline } from 'stream/promises';
import * as ytdlCore from 'ytdl-core';
import * as ytsrCore from 'ytsr';
import { Download, DownloadDocument } from './schema/download.schema';

@Injectable()
export class DownloadService {
    constructor(
        @InjectModel(Download.name)
        private readonly downloadModel: Model<DownloadDocument>,
        @Inject('FFMPEG') private readonly ffmpeg: typeof ffmpegCore,
        @Inject('IMGDL') private readonly imgdl: typeof imgdlCore,
        @Inject('YTDL') private readonly ytdl: typeof ytdlCore,
        @Inject('YTSR') private readonly ytsr: typeof ytsrCore
    ) {}

    async create(data: Download): Promise<DownloadDocument> {
        return await new this.downloadModel(data).save();
    }

    async getById(channelId: string): Promise<DownloadDocument> {
        return await this.downloadModel.findOne({ id: channelId }).exec();
    }

    async updateById(id: string, data: object): Promise<DownloadDocument> {
        return await this.downloadModel.findByIdAndUpdate(id, data);
    }

    async updatedDownloadsById(
        id: string,
        downloads: Downloads[]
    ): Promise<DownloadDocument> {
        return await this.downloadModel.findByIdAndUpdate(
            id,
            { downloads },
            { new: true }
        );
    }

    public async downloadVideo(
        videoInfo: IVideoInfo,
        outputFolder: string
    ): Promise<string> {
        try {
            const { videoId } = videoInfo;

            const { outputAudio, outputVideo, outputFile } =
                await outputAudioVideoFilePath(videoInfo, outputFolder);

            if (await fileExists(outputFile)) return outputFile;

            const audioWriteable = createWriteStream(outputAudio);
            const audioReadable = this.ytdl(videoId, {
                filter: 'audioonly',
                quality: 'highestaudio'
            });

            const videoWriteable = createWriteStream(outputVideo);
            const videoReadable = this.ytdl(videoId, {
                filter: 'videoonly',
                quality: 'highestvideo'
            });

            await Promise.all([
                pipeline([audioReadable, audioWriteable]),
                pipeline([videoReadable, videoWriteable])
            ]);

            await this.mergeAudioVideo(outputAudio, outputVideo, outputFile);

            console.log(`Finished => ${videoInfo.title}`);
            return outputFile;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    public async downloadVideosRandom(
        videoInfos: IVideoInfo[]
    ): Promise<Downloads[]> {
        try {
            const videoPromises = videoInfos.map(async (videoInfo) => {
                const output = await this.downloadVideoRandom(videoInfo);

                const newDownload: Downloads = {
                    videoId: videoInfo.videoId,
                    filePath: output,
                    videoInfo
                };

                return newDownload;
            });

            const downloadedFiles = await Promise.all([...videoPromises]);

            return downloadedFiles;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    public async downloadVideoRandom(videoInfo: IVideoInfo): Promise<string> {
        try {
            const { videoId } = videoInfo;

            const { outputAudio, outputVideo, outputFile } =
                await outputAudioVideoFilePathRandom(videoInfo, RANDOM_PATH);

            if (await fileExists(outputFile)) {
                console.log(
                    `Exist => ${videoInfo.channelTitle}-${videoInfo.title}`
                );
                return outputFile;
            }

            const audioWriteable = createWriteStream(outputAudio);
            const audioReadable = this.ytdl(videoId, {
                filter: 'audioonly',
                quality: 'highestaudio'
            });

            const videoWriteable = createWriteStream(outputVideo);
            const videoReadable = this.ytdl(videoId, {
                filter: 'videoonly',
                quality: 'highestvideo'
            });

            await Promise.all([
                pipeline([audioReadable, audioWriteable]),
                pipeline([videoReadable, videoWriteable])
            ]);

            await this.mergeAudioVideo(outputAudio, outputVideo, outputFile);

            console.log(
                `Finished => ${videoInfo.channelTitle}-${videoInfo.title}`
            );
            return outputFile;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    private async mergeAudioVideo(
        audio: string,
        video: string,
        outputFile: string
    ): Promise<void> {
        const ffdl = this.ffmpeg();
        ffdl.addInput(audio) // audio
            .addInput(video) // video
            .format('mp4')
            .videoCodec('libx264') //  códec video H.264
            .saveToFile(outputFile);

        await new Promise((resolve, reject) => {
            ffdl.on('error', (error) => {
                reject(error);
            });

            ffdl.on('end', async () => {
                await unlink(audio);
                await unlink(video);
                resolve('END');
            });
        });
    }

    async getVideoFileById(videoId: string) {
        return await this.downloadModel.findOne(
            { 'downloads.videoId': videoId },
            { 'downloads.$': 1, _id: 0 }
        );
    }

    public async downloadVideos(
        videoInfos: IVideoInfo[],
        outputFolder: string
    ): Promise<Downloads[]> {
        try {
            const videoPromises = videoInfos.map(async (videoInfo) => {
                const output = await this.downloadVideo(
                    videoInfo,
                    outputFolder
                );

                const newDownload: Downloads = {
                    videoId: videoInfo.videoId,
                    filePath: output,
                    videoInfo
                };

                return newDownload;
            });

            return await Promise.all([...videoPromises]);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    async changeChannelInfo(
        exist: DownloadDocument,
        channelInfo: IChannelInfo
    ): Promise<DownloadDocument> {
        if (JSON.stringify(exist.channelInfo) !== JSON.stringify(channelInfo)) {
            const { outputImage, outputText } = await outputTextImagePath(
                channelInfo,
                OUTPUT_PATH
            );

            await this.downloadTextAndImage(
                channelInfo.thumbnails.high.url,
                outputImage,
                channelInfo,
                outputText
            );

            await this.updateById(exist._id, { channelInfo });
            return exist;
        }
        return exist;
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

    private async downloadImage(imgUrl: string, dest: string) {
        const url = imgUrl.replace(/=s\d+/, '=s1080');
        const { filename } = await this.imgdl.image({ url, dest });
        return filename;
    }

    private async downloadText(
        data: IChannelInfo,
        output: string
    ): Promise<void> {
        await writeFile(output, JSON.stringify(data, null, 4), 'utf-8');
    }

    async getByFilters(searches: string[]): Promise<string[]> {
        try {
            const urls = await this.getFilterUrls(searches);
            const ids: string[] = [];

            for (const url of urls) {
                const videoIds = await this.getVideoIds(url);
                if (!videoIds) continue;
                ids.push(...videoIds);
            }

            return ids;
        } catch (error) {
            throw Exception.catch(error.message + error.stack);
        }
    }

    private async getFilterUrls(searches: string[]): Promise<string[]> {
        try {
            const filtersUrls = searches.map(async (search) => {
                const filter = await this.ytsr.getFilters(search);
                const url = filter.get('Upload date').get('Last hour').url;
                return url;
            });
            return Promise.all([...filtersUrls]);
        } catch (error) {
            throw Exception.catch(error.message + error.stack);
        }
    }

    private async getVideoIds(url: string): Promise<string[]> {
        try {
            const { items } = await this.ytsr(url, { pages: 1 });
            const videos = items as ytsrCore.Video[];

            if (!items.length) return;

            return videos.map((video) => video.id);
        } catch (error) {
            throw Exception.catch(error.message + error.stack);
        }
    }
}
