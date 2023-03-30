export interface Downloads {
    videoId: string;
    filePath: string;
    videoInfo: IVideoInfo;
}

export interface IVideoInfo {
    videoId: string;
    title: string;
    channelId: string;
    channelTitle: string;
    description: string;
    upload: string;
    embed: string;
    videoUrl: string;
}
