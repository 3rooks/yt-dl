import { path } from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import { FilePathsTemp } from './ytdl-paths';

export const ffmpegDownloader = async (paths: FilePathsTemp) => {
    try {
        ffmpeg.setFfmpegPath(path);
        const { outputAudio, outputVideo, outputFile } = paths;

        ffmpeg()
            .addInput(outputAudio) // audio
            .addInput(outputVideo) // video
            .format('mp4')
            .saveToFile('ouput.mp4')
            .on('end', () => console.log('FINISHHEEEED'));
    } catch (error) {
        throw new Error(`ERROR_FFMPEG: ${error.message} - ${error.stack}`);
    }
};
