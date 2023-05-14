import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Exception } from 'src/utils/error/exception-handler';
import { isValidYoutubeUrl } from 'src/utils/get-video-id';
import { DownloadLocalChannelDto } from './dto/download-local-channel';
import { DownloadLocalVideoDto } from './dto/download-local-video';
import { LocalService } from './local.service';

@ApiTags('Local')
@Controller('local')
export class LocalController {
    constructor(private readonly localService: LocalService) {}

    @Post('video')
    async downloadVideo(@Body() { videoUrl }: DownloadLocalVideoDto) {
        try {
            if (!isValidYoutubeUrl(videoUrl))
                throw new Exception({
                    message: 'INVALID_YOUTUBE_URL',
                    status: 'BAD_REQUEST'
                });

            const status = await this.localService.downloadVideo(videoUrl);
            if (!status) return `( ﾉ ﾟｰﾟ)ﾉ ALREADY_VIDEO_EXIST`;

            return `(◡‿◡) VIDEO_DOWNLOADED`;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    @Post('channel')
    async downloadChannel(@Body() { channelUrl }: DownloadLocalChannelDto) {
        try {
            if (!isValidYoutubeUrl(channelUrl))
                throw new Exception({
                    message: 'INVALID_YOUTUBE_URL',
                    status: 'BAD_REQUEST'
                });

            const total = await this.localService.downloadChannel(channelUrl);
            return `(◡‿◡) ${total} VIDEOS DOWNLOADED`;
        } catch (error) {
            console.log(error.message + error.stack);
            throw Exception.catch(error.message);
        }
    }

    @Post('image')
    async downloadImage(@Body() { channelUrl }: DownloadLocalChannelDto) {
        try {
            if (!isValidYoutubeUrl(channelUrl))
                throw new Exception({
                    message: 'INVALID_YOUTUBE_URL',
                    status: 'BAD_REQUEST'
                });

            const results = await this.localService.downloadImage(channelUrl);
            return `IMAGE DOWNLOADED: ${results}`;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}
