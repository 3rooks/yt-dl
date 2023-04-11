import { Body, Controller, Post, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { rm, unlink } from 'fs/promises';
import { FORMAT } from 'src/constants/video-formats';
import { getChannelIdVideoId } from 'src/lib/cheerio/cheerio.aux';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { Exception } from 'src/utils/error/exception-handler';
import { isValidYoutubeUrl } from 'src/utils/get-video-id';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadVideoDto } from './dto/download-video.dto';
import { YoutubeDlService } from '../youtube-dl/youtubedl.service';
import { join } from 'path';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    private readonly mainFolder = OUTPUT_PATH;

    constructor(
        private readonly downloadService: DownloadService,
        private readonly googleService: GoogleapiService,
        private readonly youtubeDl: YoutubeDlService
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

            const { filePath, folderPath } =
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

               await this.youtubeDl.dlChannel(channelInfo.channel_url)


            // const videoIds = await this.googleService.getAllVideosFromChannel(
            //     channelId
            // );

            // const outFolder = await this.downloadService.downloadChannel(
            //     videoIds,
            //     this.googleService,
            //     clientId
            // );

            const outFolder = join(this.mainFolder, `${channelInfo.name}_${channelId}`)

            const outZip = await this.downloadService.compression(
                channelInfo,
                outFolder,
                clientId
            );

            const encodeFileName = encodeURIComponent(
                `${channelInfo.name}_${channelId}`
            );

            res.set({
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${encodeFileName}.${FORMAT.ZIP}"`
            });

            const fileStream = createReadStream(outZip);

            fileStream.on('close', async () => {
                await rm(outFolder, { recursive: true, force: true });
                await unlink(outZip);
            });

            return new StreamableFile(fileStream);
        } catch (error) {
            console.log(error.message + error.stack);
            throw Exception.catch(error.message);
        }
    }

    @Post('image')
    async downloadImage(
        @Body() { channelUrl }: DownloadChannelDto,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        const { channelId } = await getChannelIdVideoId(channelUrl);
        const channelInfo = await this.googleService.getChannelInfo(channelId);

        const output = await this.downloadService.downloadImage(channelInfo);

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
