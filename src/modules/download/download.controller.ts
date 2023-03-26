import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common/file-stream';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { changeAuthor } from 'src/utils/dl-fn/change-author';
import { existVideo } from 'src/utils/dl-fn/exist-video';
import { Exception } from 'src/utils/error/exception-handler';
import { validateAndExtractVideoId } from 'src/utils/get-video-id';
import { outputTextImagePath } from 'src/utils/ytdl-paths';
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
            const channelId =
                await this.googleService.getChannelIdFromChannelUrl(channelUrl);

            if (!channelId)
                throw new Exception({
                    message: 'CHANNEL_NOT_FOUND',
                    status: 'NOT_FOUND'
                });

            let exist = await this.downloadService.getByIdC(channelId);

            if (!exist) {
                const channelInfo = await this.googleService.getChannelInfo(
                    channelId
                );

                const { outputImage, outputText } = await outputTextImagePath(
                    channelInfo
                );
                await this.downloadService.downloadTextAndImage(
                    channelInfo.thumbnails.high.url,
                    outputImage,
                    channelInfo,
                    outputText
                );

                exist = await this.downloadService.create({
                    id: channelId,
                    channelInfo: await this.googleService.getChannelInfo(
                        channelId
                    ),
                    downloads: []
                });
            } else {
                const channelInfo = await this.googleService.getChannelInfo(
                    channelId
                );
                exist = await this.downloadService.changeChannelInfo(
                    exist,
                    channelInfo
                );
            }

            const downloadedVideos = exist.downloads.map(
                (download) => download.videoId
            );
            const videoIds = await this.googleService.getAllVideosFromChannel(
                channelId
            );

            const infosVideos: IVideoInfo[] = [];

            for (const id of videoIds) {
                if (downloadedVideos.includes(id)) continue;
                const videoInfo = await this.googleService.getVideoInfo(id);
                infosVideos.push(videoInfo);
            }

            const downloadsInfos = await this.downloadService.downloadVideos(
                infosVideos
            );

            exist.downloads.push(...downloadsInfos);
            await this.downloadService.updateById(exist._id, {
                downloads: exist.downloads
            });

            return exist.downloads;
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
}
