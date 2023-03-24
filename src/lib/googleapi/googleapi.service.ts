import { Inject, Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/video-info.interface';
import { Exception } from 'src/utils/error/exception-handler';
import {
    extractChannelIdFromChannelUrl,
    extractChannelIdFromUsername
} from 'src/utils/get-channel-id';
import { isValidVideoId } from 'src/utils/get-video-id';

@Injectable()
export class GoogleapiService {
    constructor(
        @Inject('YOUTUBE_API') private readonly youtube: typeof google
    ) {}

    async getAllVideosFromChannel(channelId: string): Promise<string[]> {
        try {
            let videos = [];
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
                (video) => video.snippet.resourceId.videoId
            );

            return videoIds;
            // `https://www.youtube.com/watch?v=${videoId}`
        } catch (error) {
            throw Exception.create(error.message);
        }
    }

    async getChannelIdFromUrl(url: string): Promise<string> {
        try {
            let channelId: string | null = null;

            channelId = extractChannelIdFromChannelUrl(url);

            if (!channelId) {
                channelId = await extractChannelIdFromUsername(
                    url,
                    this.youtube
                );
            }

            if (!channelId) {
                throw new Exception({
                    status: 'NOT_FOUND',
                    message: 'CHANNEL_ID_NOT_FOUND'
                });
            }

            return channelId;
        } catch (error) {
            throw Exception.create(error.message);
        }
    }

    async getChannelInfo(channelId: string): Promise<IChannelInfo> {
        // const { data } = await this.youtube.videos.list({
        //     part: 'snippet',
        //     id: videoId
        // });
        // const a = data.items[0].snippet.channelId;

        const { data } = await this.youtube.channels.list({
            part: 'snippet,statistics',
            id: channelId
        });

        const channelInfo: IChannelInfo = {
            kind: data.items[0].kind,
            channelId: data.items[0].id,
            name: data.items[0].snippet.title,
            user: data.items[0].snippet.customUrl,
            channel_url: `https://www.youtube.com/channel/${data.items[0].id}`,
            user_url: `https://www.youtube.com/${data.items[0].snippet.customUrl}`,
            description: data.items[0].snippet.description,
            thumbnails: data.items[0].snippet.thumbnails,
            video_count: data.items[0].statistics.videoCount,
            subscriber_count: data.items[0].statistics.subscriberCount
        };

        return channelInfo;
    }

    async getVideoInfo(videoId: string): Promise<IVideoInfo> {
        try {
            if (!isValidVideoId(videoId))
                throw new Exception({
                    status: 'BAD_REQUEST',
                    message: 'INVALID_ID_VIDEO'
                });

            const { data } = await this.youtube.videos.list({
                part: 'snippet',
                id: videoId
            });

            const videoInfo: IVideoInfo = {
                kind: data.items[0].kind,
                videoId: data.items[0].id,
                channelId: data.items[0].snippet.channelId,
                channelTitle: data.items[0].snippet.channelTitle,
                title: data.items[0].snippet.title,
                description: data.items[0].snippet.description,
                upload: data.items[0].snippet.publishedAt,
                embed: `https://www.youtube.com/embed/${data.items[0].id}`,
                videoUrl: `https://www.youtube.com/watch?v=${data.items[0].id}`
            };

            return videoInfo;
        } catch (error) {
            throw Exception.create(error.message);
        }
    }
}

/*
    contentDetails: returns details about the video content, such as duration and resolution.
    statistics: returns statistics about the video, such as number of views, likes and comments.
    player: returns information about the video player to embed the video on a website.
    topicDetails: returns information about the topics covered in the video.
*/
