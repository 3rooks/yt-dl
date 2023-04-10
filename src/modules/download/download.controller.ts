import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { rm, unlink } from 'fs/promises';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { getChannelIdVideoId } from 'src/lib/cheerio/cheerio.aux';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
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
    async downloadVideo(
        @Body() { clientId, videoUrl }: DownloadVideoDto,
        @Res({ passthrough: true }) res: Response
    ) {
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

            const { outputFile, outputFolder } =
                await this.downloadService.downloadVideo(
                    videoId,
                    videoInfo,
                    clientId
                );

            const name = `${videoInfo.title}_${videoInfo.videoId}`;
            const encodeFileName = encodeURIComponent(name);

            res.set({
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="${encodeFileName}.${FORMAT.MP4}"`
            });

            const fileStream = createReadStream(outputFile);

            fileStream.on('close', async () => {
                await rm(outputFolder, { recursive: true, force: true });
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
            const { name } = await this.googleService.getChannelInfo(channelId);
            const channelName = `${name}_${channelId}`;

            const allIdsChannel =
                await this.googleService.getAllVideosFromChannel(channelId);

            const { channelFolder, outputZip } =
                await this.downloadService.downloadVideos(
                    allIdsChannel,
                    channelName,
                    clientId
                );

            const encodeFileName = encodeURIComponent(channelName);

            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${encodeFileName}.${FORMAT.ZIP}"`
            });

            const fileStream = createReadStream(outputZip);

            fileStream.on('close', async () => {
                await rm(channelFolder, { recursive: true, force: true });
                await unlink(outputZip);
            });

            return new StreamableFile(fileStream);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    @Post('image')
    async downloadImage(
        @Body() { clientId, channelUrl }: DownloadChannelDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { channelId } = await getChannelIdVideoId(channelUrl);
        const channelInfo = await this.googleService.getChannelInfo(channelId);

        const name = `${channelId}.${FORMAT.JPG}`;
        const dest = join(this.mainFolder, name);

        const output = await this.downloadService.downloadImage(
            channelInfo.thumbnails.high.url,
            dest
        );

        const encodeFileName = encodeURIComponent(channelId);

        res.set({
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `attachment; filename="${encodeFileName}.${FORMAT.JPG}"`
        });

        const fileStream = createReadStream(dest);

        fileStream.on('close', async () => {
            await unlink(output);
        });

        return new StreamableFile(fileStream);
    }
}
