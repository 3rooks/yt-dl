export interface FfmpegProgress {
    frames: number;
    currentFps: number;
    currentKbps: number;
    targetSize: number;
    timemark: string;
}

export interface MergeProgress {
    frames: number;
    fps: number;
    kbps: number;
    size: number;
    time: string;
}
