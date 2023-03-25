export interface IChannelInfo {
    kind: string;
    channelId: string;
    name: string;
    user: string | undefined;
    channel_url: string;
    user_url: string;
    description: string;
    thumbnails: ThumbnailInfo;
    video_count: number;
    subscriber_count: number;
}

interface ThumbnailInfo {
    default: {
        url: string;
        width: number;
        height: number;
    };
    medium: {
        url: string;
        width: number;
        height: number;
    };
    high: {
        url: string;
        width: number;
        height: number;
    };
}
