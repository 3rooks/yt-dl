import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';
import { CONFIG } from 'src/constants/config';

@Injectable()
export class GoogleapiService {
    constructor(
        @Inject('GOOGLE') private readonly googleApi: typeof google,
        private readonly config: ConfigService
    ) {}

    async getVideosFromChannel(channelId: string): Promise<string[]> {
        const youtube = await this.googleApi.youtube({
            version: 'v3',
            auth: this.config.get<string>(CONFIG.GOOGLE_KEY)
        });

        let videos: youtube_v3.Schema$PlaylistItem[] = [];
        let nextPageToken: string | undefined = undefined;

        do {
            const response = await youtube.playlistItems.list({
                playlistId: 'UU' + channelId.substring(2),
                maxResults: 50,
                part: ['snippet'],
                pageToken: nextPageToken
            });

            if (response && response.data && response.data.items) {
                videos.push(...response.data.items);
                nextPageToken = response.data.nextPageToken;
            } else {
                nextPageToken = undefined;
            }
        } while (nextPageToken);

        const videoIds = videos.map(
            (video) => `${video.snippet.resourceId.videoId}`
        );
        return videoIds;

        // `https://www.youtube.com/watch?v=${videoId}`
    }
}
