import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Res,
    StreamableFile
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';
import { CronJob } from 'cron';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { getChannelIdVideoId } from 'src/lib/cheerio/cheerio.aux';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import {
    createChannel,
    getVideosToDownload,
    updateChannelInfo
} from 'src/utils/dl-fn/dl-channel';
import { Exception } from 'src/utils/error/exception-handler';
import { isValidYoutubeUrl } from 'src/utils/get-video-id';
import { OUTPUT_PATH, RANDOM_PATH } from 'src/utils/paths.resource';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadVideoDto } from './dto/download-video.dto';
import { FiltersDto } from './dto/filters.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly downloadService: DownloadService,
        private readonly googleService: GoogleapiService,
        @Inject(SchedulerRegistry) private schedulerRegistry: SchedulerRegistry
    ) {}

    @Post('video')
    async downloadVideo(
        @Body() { videoUrl }: DownloadVideoDto,
        @Res() res: Response
    ): Promise<void> {
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
                    OUTPUT_PATH,
                    this.googleService,
                    this.downloadService
                );
            } else {
                exist = await updateChannelInfo(
                    exist,
                    channelId,
                    OUTPUT_PATH,
                    this.downloadService,
                    this.googleService
                );
            }

            const existVideo = exist.downloads.find(
                (video) => video.videoId === videoId
            );

            if (!existVideo) {
                const videoInfo = await this.googleService.getVideoInfo(
                    videoId
                );

                const filePath = await this.downloadService.downloadVideo(
                    videoInfo,
                    OUTPUT_PATH
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

                return res.redirect(`video/${videoId}`);
            }

            return res.redirect(`video/${videoId}`);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    @Post('channel')
    async downloadChannel(@Body() { channelUrl }: DownloadChannelDto) {
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
                    OUTPUT_PATH,
                    this.googleService,
                    this.downloadService
                );
            } else {
                exist = await updateChannelInfo(
                    exist,
                    channelId,
                    OUTPUT_PATH,
                    this.downloadService,
                    this.googleService
                );
            }

            const videosToDownload = await getVideosToDownload(
                exist,
                this.googleService
            );

            const downloads = await this.downloadService.downloadVideos(
                videosToDownload,
                OUTPUT_PATH
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
    ) {
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

    private cronJob: CronJob;

    @Post('filters-start')
    startJob(@Body() { filter }: FiltersDto) {
        // */3 * * * * 3 min
        // */5 * * * * 5 min
        const pattern = '*/3 * * * *';
        this.cronJob = new CronJob(pattern, async () => {
            await this.filters(filter);
        });
        this.schedulerRegistry.addCronJob('my-job', this.cronJob);
        this.cronJob.start();
        return 'Job iniciado';
    }

    @Post('filters-stop')
    stopJob() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.schedulerRegistry.deleteCronJob('my-job');
            this.cronJob = null;
        }
        return 'Job detenido';
    }

    private async filters(filter: string[]) {
        try {
            const videoIds = await this.downloadService.getLastHourVideoIds(
                filter
            );

            const infosVideos: IVideoInfo[] = [];

            for (const id of videoIds) {
                const videoInfo = await this.googleService.getVideoInfoRandom(
                    id
                );
                if (!videoInfo) continue;
                infosVideos.push(videoInfo);
            }

            const outputfiles = await this.downloadService.downloadVideos(
                infosVideos,
                RANDOM_PATH
            );

            return outputfiles;
        } catch (error) {
            throw Exception.catch(error.message + error.stack);
        }
    }
}
