import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as ffmpegCore from 'fluent-ffmpeg';
import { createWriteStream } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import * as imgdlCore from 'image-downloader';
import { Model } from 'mongoose';
import { outputPaths } from 'src/utils/ytdl-paths';
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
        @Inject('YTSR') private readonly ytsr: typeof ytsrCore,
    ) {}

    async getByChannelId(channelId: string): Promise<Download> {
        return await this.downloadModel.findOne({ channelId }).exec();
    }

    async getVideoById(channelId: string, videoId: string): Promise<string> {
        const doc = await this.getByChannelId(channelId);
        const vid = doc.downloads.find((e) => e.videoId === videoId);
        console.log(vid);
        return vid.filePath;
    }

    async updateById(id: string, data: object) {
        return this.downloadModel.findByIdAndUpdate(id, data);
    }

    async donwloadManyVideos(url: string) {
        const data = await this.ytsr.getFilters(url);
        const a = data.get('');

        console.log(data);
    }

    public async downloadVideo(url: string): Promise<string> {
        const info = await this.ytdl.getInfo(url);

        const {
            outputAudio,
            outputVideo,
            outputFile,
            outputImage,
            outputText
        } = await outputPaths(info);

        await this.downloadImage(
            info.videoDetails.author.thumbnails[0].url,
            outputImage
        );
        await this.saveInfoTxt(info.videoDetails, outputText);

        const audioWriteable = createWriteStream(outputAudio);
        const audioReadable = this.ytdl(url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        const videoWriteable = createWriteStream(outputVideo);
        const videoReadable = this.ytdl(url, {
            filter: 'videoonly',
            quality: 'highestvideo'
        });

        await Promise.all([
            pipeline([audioReadable, audioWriteable]),
            pipeline([videoReadable, videoWriteable])
        ]);

        await this.mergeAudioVideo(outputAudio, outputVideo, outputFile);

        console.log(`Finished => ${outputFile.split('\\').pop()}`);
        return outputFile;
    }

    private async downloadImage(imgUrl: string, dest: string) {
        const url = imgUrl.replace(/(-g=s)(\d+[0-9])/, '-g=s1080');

        const { filename } = await this.imgdl.image({ url, dest });

        return filename;
    }

    private async saveInfoTxt(data: ytdlCore.MoreVideoDetails, output: string) {
        await writeFile(output, JSON.stringify(data, null, 4), 'utf-8');
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

    async create(data: Download): Promise<Download> {
        return new this.downloadModel(data).save();
    }

    async findAll(): Promise<Download[]> {
        return;
    }

    update(id: number, updateDownloadDto: object) {
        return `This action updates a #${id} download`;
    }

    remove(id: number) {
        return `This action removes a #${id} download`;
    }
}
