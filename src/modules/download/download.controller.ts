import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common/file-stream';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { changeAuthor } from 'src/utils/dl-fn/change-author';
import { existVideo } from 'src/utils/dl-fn/exist-video';
import { Exception } from 'src/utils/error/exception-handler';
import { validateAndExtractVideoId } from 'src/utils/get-video-id';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadVideoDto } from './dto/download-video.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly downloadService: DownloadService,
        private readonly googleService: GoogleapiService
    ) {}

    @Post('video')
    async download(@Body() { videoUrl }: DownloadVideoDto) {
        try {
            const videoId = validateAndExtractVideoId(videoUrl);
            const videoInfo = await this.googleService.getVideoInfo(videoId);
            const channelInfo = await this.googleService.getChannelInfo(
                videoInfo.channelId
            );
            let exist = await this.downloadService.getByIdC(
                videoInfo.channelId
            );

            exist = await changeAuthor(
                exist,
                videoInfo,
                channelInfo,
                this.downloadService
            );

            const res = await existVideo(
                exist,
                videoInfo,
                this.downloadService
            );

            return res;
        } catch (error) {
            throw Exception.catch(error.message);
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
            res.set({
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${downloads[0].videoInfo.title}.mp4"`
            });

            const stream = createReadStream(downloads[0].filePath);
            return new StreamableFile(stream);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    @Get('info')
    async channelInfo(@Body() { videoUrl }: DownloadVideoDto) {
        const id = await this.googleService.getChannelIdFromUrl(videoUrl);
        return await this.googleService.getChannelInfo(id);
    }
}
