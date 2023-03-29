export interface Downloads {
    videoId: string;
    filePath: string;
    videoInfo: IVideoInfo;
}

export interface IVideoInfo {
    videoId: string;
    title: string;
    description: string;
    upload: string;
    embed: string;
    videoUrl: string;
}
