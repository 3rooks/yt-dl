import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    StreamableFile
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { Downloads } from 'src/interfaces/downloads.interface';
import { getChannelIdVideoId } from 'src/lib/cheerio/cheerio.aux';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import {
    createChannel,
    getVideosToDownload,
    updateChannelInfo
} from 'src/utils/dl-fn/channel-dl-fn';
import { Exception } from 'src/utils/error/exception-handler';
import { isValidYoutubeUrl } from 'src/utils/get-video-id';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadVideoDto } from './dto/download-video.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    private readonly mainFolder = OUTPUT_PATH;

    constructor(
        private readonly downloadService: DownloadService,
        private readonly googleService: GoogleapiService
    ) {}

    @Post('video')
    async downloadVideo(@Body() { clientId, videoUrl }: DownloadVideoDto) {
        try {
            if (!isValidYoutubeUrl(videoUrl))
                throw new Exception({
                    message: 'INVALID_YOUTUBE_URL',
                    status: 'BAD_REQUEST'
                });

            const { channelId, videoId } = await getChannelIdVideoId(videoUrl);

            let exist = await this.downloadService.getById(channelId);

            if (!exist) {
                exist = await createChannel(
                    channelId,
                    this.mainFolder,
                    this.googleService,
                    this.downloadService
                );
            } else {
                exist = await updateChannelInfo(
                    exist,
                    channelId,
                    this.mainFolder,
                    this.googleService,
                    this.downloadService
                );
            }

            const existVideo = exist.downloads.find(
                (video) => video.videoId === videoId
            );

            if (!existVideo) {
                const videoInfo = await this.googleService.getVideoInfo(
                    videoId
                );

                if (!videoInfo)
                    throw new Exception({
                        message: 'LIVE_VIDEO_NOT_ALLOWED',
                        status: 'BAD_REQUEST'
                    });

                const filePath = await this.downloadService.downloadVideo(
                    videoInfo,
                    this.mainFolder,
                    clientId
                );

                exist.downloads.push({
                    videoId,
                    filePath,
                    videoInfo
                });

                await this.downloadService.updatedDownloadsById(
                    exist._id,
                    exist.downloads
                );

                return videoId;
            }

            return videoId;
        } catch (error) {
            console.log(error.message + error.stack);
        }
    }

    @Post('channel')
    async downloadChannel(
        @Body() { channelUrl }: DownloadChannelDto
    ): Promise<Downloads[]> {
        try {
            if (!isValidYoutubeUrl(channelUrl))
                throw new Exception({
                    message: 'INVALID_YOUTUBE_URL',
                    status: 'BAD_REQUEST'
                });

            const { channelId } = await getChannelIdVideoId(channelUrl);

            let exist = await this.downloadService.getById(channelId);

            if (!exist) {
                exist = await createChannel(
                    channelId,
                    this.mainFolder,
                    this.googleService,
                    this.downloadService
                );
            } else {
                exist = await updateChannelInfo(
                    exist,
                    channelId,
                    this.mainFolder,
                    this.googleService,
                    this.downloadService
                );
            }

            const videosToDownload = await getVideosToDownload(
                exist,
                this.googleService
            );

            const downloads = await this.downloadService.downloadVideos(
                videosToDownload,
                this.mainFolder
            );

            exist.downloads.push(...downloads);
            const updated = await this.downloadService.updatedDownloadsById(
                exist._id,
                exist.downloads
            );

            return updated.downloads;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    @Get('video/:id')
    async getVideoFileById(
        @Param('id') videoId: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        try {
            const exist = await this.downloadService.getVideoFileById(videoId);

            if (!exist) {
                res.set({
                    'Content-Type': 'application/json'
                });

                throw new Exception({
                    status: 'NOT_FOUND',
                    message: 'VIDEO_NOT_FOUND'
                });
            }

            const { downloads } = exist;
            const filePath = downloads[0].filePath;
            const fileName = downloads[0].videoInfo.title;
            const encodeFileName = encodeURIComponent(fileName);
            res.set({
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${encodeFileName}.mp4"`
            });

            return new StreamableFile(createReadStream(filePath));
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}
