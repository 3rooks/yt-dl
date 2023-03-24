import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common/file-stream';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { changeAuthor } from 'src/utils/dl-fn/change-author';
import { existVideo } from 'src/utils/dl-fn/exist-video';
import { Exception } from 'src/utils/error/exception-handler';
import { getInfo, validateURL } from 'ytdl-core';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadVideoDto } from './dto/download-video.dto';
import { VideoDownload } from './schema/video-download.schema';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly downloadService: DownloadService,
        private readonly googleService: GoogleapiService
    ) {}

    @Post('video')
    async download(
        @Body() { videoUrl }: DownloadVideoDto
    ): Promise<VideoDownload[]> {
        try {
            const isValid = validateURL(videoUrl);

            if (!isValid)
                throw new Exception({
                    status: 'BAD_REQUEST',
                    message: 'INVALID_YOUTUBE_URL'
                });

            const { videoDetails } = await getInfo(videoUrl);
            const { channelId } = videoDetails;

            let exist = await this.downloadService.getByChannelId(channelId);

            exist = await changeAuthor(
                exist,
                videoDetails,
                this.downloadService
            );

            const results = await existVideo(
                exist,
                videoDetails,
                this.downloadService
            );

            return results;
        } catch (error) {
            throw Exception.create(error.message);
        }
    }

    @Post('channel')
    async downloadChannel(@Body() { channelUrl }: DownloadChannelDto) {
        try {
            const channelId = await this.googleService.getChannelIdFromUrl(
                channelUrl
            );

            if (!channelId)
                throw new Exception({
                    status: 'NOT_FOUND',
                    message: 'CHANNEL_NOT_FOUND'
                });

            const videoIds = await this.googleService.getAllVideosFromChannel(
                channelId
            );

            // let exist = await this.downloadService.getByChannelId(channelId);

            // exist = await changeAuthor(
            //     exist,
            //     videoDetails,
            //     this.downloadService
            // );

            // // ***********************************************************************

            // // Verificar si los videos ya existen en la lista de descarga
            // const newDownloads = [];
            // for (const videoId of videoIds) {
            //     const videoExists = exist.downloads.some(
            //         (download) => download.videoId === videoId
            //     );
            //     if (!videoExists) {
            //         newDownloads.push(videoId);
            //     }
            // }

            // // Descargar los videos que no existen en la lista de descarga
            // if (newDownloads.length > 0) {
            //     const results = await this.downloadService.donwloadManyVideos(
            //         newDownloads
            //     );

            //     for (const result of results) {
            //         exist.downloads.push(result);
            //     }

            //     await this.downloadService.updateById(exist._id, exist);
            // }

            // if (!existVideo) {
            //     const results = await this.downloadService.donwloadManyVideos(
            //         videoIds
            //     );

            //     for (const res of results) {
            //         exist.downloads.push(res);
            //     }

            //     await this.downloadService.updateById(exist._id, exist);
            //     return exist.downloads;
            // }

            return;
        } catch (error) {
            throw Exception.create(error.message);
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
            res.set({
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${downloads[0].videoDetails.title}.mp4"`
            });

            const stream = createReadStream(downloads[0].filePath);
            return new StreamableFile(stream);
        } catch (error) {
            throw Exception.create(error.message);
        }
    }

    @Get('info')
    async channelInfo(@Body() { videoUrl }: DownloadVideoDto) {
        return await this.googleService.getChannelIdFromUrl(videoUrl);
    }
}
