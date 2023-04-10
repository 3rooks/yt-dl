import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createWriteStream, existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import * as miniget from 'miniget';
import { Model } from 'mongoose';
import { FORMAT } from 'src/constants/video-formats';
import { Downloads, IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
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

    public async downloadImage(imgUrl: string, dest: string) {
        const url = imgUrl.replace(/=s\d+/, '=s1080');
        const img = await miniget(url);
        const out = createWriteStream(dest);
        await pipeline([img, out]);
        return dest;
    }
}
