import { IVideoInfo } from './video-info.interface';

export interface Downloads {
    videoId: string;
    filePath: string;
    videoInfo: IVideoInfo;
}
