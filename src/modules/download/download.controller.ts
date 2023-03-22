import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { changeAuthor } from 'src/utils/dl-fn/change-author';
import { existVideo } from 'src/utils/dl-fn/exist-video';
import { Exception } from 'src/utils/error/exception-handler';
import { getInfo, validateURL } from 'ytdl-core';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadVideoDto } from './dto/download-video.dto';
import { DownloadItem } from './schema/download-items.schema';

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
    ): Promise<DownloadItem[]> {
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
        const channelId = await this.googleService.getChannelIdFromUrl(
            channelUrl
        );
        const videoIds = await this.googleService.getVideosFromChannel(
            channelId
        );
        console.log(videoIds.length);

        return videoIds;
    }
}
