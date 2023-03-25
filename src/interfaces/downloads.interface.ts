export interface Downloads {
    videoId: string;
    filePath: string;
    videoInfo: IVideoInfo;
}

export interface IVideoInfo {
    kind: string;
    videoId: string;
    channelId: string;
    channelTitle: string;
    title: string;
    description: string;
    upload: string;
    embed: string;
    videoUrl: string;
}
