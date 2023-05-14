import { Injectable } from '@nestjs/common';
import { getChannelIdVideoId } from 'src/lib/cheerio/cheerio.aux';
import { YoutubeDlService } from 'src/lib/youtube-dl/youtubedl.service';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { getVideoID } from 'ytdl-core';

@Injectable()
export class LocalService {
    private readonly folder = OUTPUT_PATH;

    constructor(private readonly ytdlService: YoutubeDlService) {}

    async downloadVideo(videoUrl: string) {
        try {
            const videoId = await getVideoID(videoUrl);

            return await this.ytdlService.dLocalVideo(videoId);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    async downloadChannel(channelUrl: string) {
        try {
            const { channelId } = await getChannelIdVideoId(channelUrl);

            return await this.ytdlService.dLocalChannel(channelId);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    async downloadImage(channelUrl: string) {
        const { channelId } = await getChannelIdVideoId(channelUrl);
        return await this.ytdlService.dLocalImage(channelId);
    }
}
