import { Inject, Injectable } from '@nestjs/common';
import { google, youtube_v3 } from 'googleapis';

@Injectable()
export class GoogleapiService {
    constructor(
        @Inject('YOUTUBE_API') private readonly youtube: typeof google
    ) {}

    async getVideosFromChannel(channelId: string): Promise<string[]> {
        let videos: youtube_v3.Schema$PlaylistItem[] = [];
        let nextPageToken: string | undefined = undefined;

        do {
            const response = await this.youtube.playlistItems.list({
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

    async getChannelIdFromUrl(customUrl: string): Promise<string> {
        let channelId: string | null = null;

        // Extraer el ID de canal del formato "https://www.youtube.com/channel/{channelId}"
        const channelIdMatch = customUrl.match(
            /youtube.com\/channel\/([\w-]+)/
        );
        if (channelIdMatch) {
            channelId = channelIdMatch[1];
        }

        // Extraer el ID de canal del formato "https://www.youtube.com/@{username}/featured"
        const usernameMatch = customUrl.match(/youtube.com\/@([\w-]+)/);
        if (usernameMatch) {
            // Llame a la API de búsqueda de canales de YouTube
            const response = await this.youtube.search.list({
                part: 'snippet',
                type: 'channel',
                q: usernameMatch[1]
            });

            // Extraer el ID de canal de la respuesta de la API
            channelId = response.data.items[0]?.snippet.channelId;
        }

        if (!channelId) {
            throw new Error(
                `No se encontró un canal para la URL "${customUrl}"`
            );
        }

        return channelId;
    }
}
