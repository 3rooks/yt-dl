export interface IChannelInfo {
    channelId: string;
    name: string;
    user: string;
    channel_url: string;
    user_url: string;
    description: string;
    thumbnails: IThumbnailInfo;
    video_count: number;
    subscriber_count: number;
}

interface IThumbnailInfo {
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
