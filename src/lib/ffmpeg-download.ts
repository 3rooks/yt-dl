import { FORMAT } from 'src/constants/video-formats';
import { ffmpegVideo } from './ffmpeg-downloader';
import { FilePathsTemp } from './ytdl-paths';

export const ffmpegMergeAudioVideo = (paths: FilePathsTemp) => {
    const { outputAudio, outputVideo, outputFile } = paths;

    ffmpegVideo
        .addInput(outputAudio) // audio
        .addInput(outputVideo) // video
        .format(FORMAT.MP4)
        .saveToFile(outputFile);

    ffmpegVideo.on('error', (error) => {
        throw new Error(`ERROR_MERGE_VIDEO: ${error.message} - ${error.stack}`);
    });
};
