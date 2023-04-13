import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { rm, unlink } from 'fs/promises';
import { FORMAT } from 'src/constants/video-formats';
import { getChannelIdVideoId } from 'src/lib/cheerio/cheerio.aux';
import { GoogleapiService } from 'src/lib/googleapis/googleapis.service';
import { Exception } from 'src/utils/error/exception-handler';
import { isValidYoutubeUrl } from 'src/utils/get-video-id';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadImageDto } from './dto/download-image.dto';
import { DownloadVideoDto } from './dto/download-video.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    private readonly folder = OUTPUT_PATH;

    constructor(
        private readonly downloadService: DownloadService,
        private readonly googleService: GoogleapiService
    ) {}

    @Post('video')
    async downloadVideo(
        @Body() { clientId, videoUrl }: DownloadVideoDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        try {
            if (!isValidYoutubeUrl(videoUrl))
                throw new Exception({
                    message: 'INVALID_YOUTUBE_URL',
                    status: 'BAD_REQUEST'
                });

            const { videoId } = await getChannelIdVideoId(videoUrl);
            const videoInfo = await this.googleService.getVideoInfo(videoId);

            if (!videoInfo)
                throw new Exception({
                    message: 'LIVE_VIDEO_NOT_ALLOWED',
                    status: 'BAD_REQUEST'
                });

            const { videoName, filePath, folderPath } =
                await this.downloadService.downloadVideo(
                    videoId,
                    videoInfo,
                    this.folder,
                    clientId
                );

            const encodeFileName = encodeURIComponent(videoName);

            res.set({
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${encodeFileName}.${FORMAT.MP4}"`
            });

            const fileStream = createReadStream(filePath);

            fileStream.on('close', async () => {
                await rm(folderPath, { recursive: true, force: true });
            });

            return new StreamableFile(fileStream);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    @Post('channel')
    async downloadChannel(
        @Body() { clientId, channelUrl }: DownloadChannelDto,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            if (!isValidYoutubeUrl(channelUrl))
                throw new Exception({
                    message: 'INVALID_YOUTUBE_URL',
                    status: 'BAD_REQUEST'
                });

            const { channelId } = await getChannelIdVideoId(channelUrl);
            const channelInfo = await this.googleService.getChannelInfo(
                channelId
            );

            const videoIds = await this.googleService.getAllVideosFromChannel(
                channelId
            );

            const { filePath, folderName, folderPath } =
                await this.downloadService.downloadChannel(
                    videoIds,
                    channelInfo,
                    this.folder,
                    clientId
                );

            const encodeFileName = encodeURIComponent(folderName);

            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${encodeFileName}.${FORMAT.ZIP}"`
            });

            const fileStream = createReadStream(filePath);

            fileStream.on('close', async () => {
                await rm(folderPath, { recursive: true, force: true });
                await unlink(filePath);
            });

            return new StreamableFile(fileStream);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    @Post('image')
    async downloadImage(
        @Body() { channelUrl }: DownloadImageDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        const { channelId } = await getChannelIdVideoId(channelUrl);
        const channelInfo = await this.googleService.getChannelInfo(channelId);

        const output = await this.downloadService.downloadImage(
            channelInfo,
            this.folder
        );

        const encodeFileName = encodeURIComponent(channelId);

        res.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `attachment; filename="${encodeFileName}.${FORMAT.JPG}"`
        });

        const fileStream = createReadStream(output);

        fileStream.on('close', async () => {
            await unlink(output);
        });

        return new StreamableFile(fileStream);
    }
}
