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
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import {
    createChannel,
    getVideosToDownload,
    updateChannelInfo
} from 'src/utils/dl-fn/dl-channel';
import { Exception } from 'src/utils/error/exception-handler';
import { validateAndExtractVideoId } from 'src/utils/get-video-id';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
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
    async download(
        @Body() { videoUrl }: DownloadVideoDto,
        @Res() res: Response
    ): Promise<void> {
        try {
            const videoId = validateAndExtractVideoId(videoUrl);

            const videoInfo = await this.googleService.getVideoInfo(videoId);

            let exist = await this.downloadService.getById(videoInfo.channelId);

            if (!exist) {
                exist = await createChannel(
                    videoInfo.channelId,
                    OUTPUT_PATH,
                    this.googleService,
                    this.downloadService
                );
            } else {
                exist = await updateChannelInfo(
                    exist,
                    await this.googleService.getChannelInfo(
                        videoInfo.channelId
                    ),
                    OUTPUT_PATH,
                    this.downloadService
                );
            }

            const existVideo = exist.downloads.find(
                (video) => video.videoId === videoId
            );

            if (!existVideo) {
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
            const channelId =
                await this.googleService.getChannelIdFromChannelUrl(channelUrl);

            if (!channelId)
                throw new Exception({
                    message: 'CHANNEL_NOT_FOUND',
                    status: 'NOT_FOUND'
                });

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
                    await this.googleService.getChannelInfo(channelId),
                    OUTPUT_PATH,
                    this.downloadService
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
            const videoIds = await this.downloadService.getByFilters(filter);

            const infosVideos: IVideoInfo[] = [];

            for (const id of videoIds) {
                const videoInfo = await this.googleService.getVideoInfoRandom(
                    id
                );
                if (!videoInfo) continue;
                infosVideos.push(videoInfo);
            }

            const outputfiles = await this.downloadService.downloadVideosRandom(
                infosVideos
            );

            return outputfiles;
        } catch (error) {
            throw Exception.catch(error.message + error.stack);
        }
    }
}
