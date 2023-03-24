export interface IChannelInfo {
    kind: string;
    channelId: string;
    name: string;
    user: string;
    channel_url: string;
    user_url: string;
    description: string;
    thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];
    video_count: number;
    subscriber_count: number;
}
