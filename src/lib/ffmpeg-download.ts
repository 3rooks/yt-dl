import { path } from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import { unlink } from 'fs/promises';
import { FORMAT } from 'src/constants/video-formats';
import { FilePathsTemp } from './ytdl-paths';

export const ffmpegDownloader = (paths: FilePathsTemp) => {
    const { outputAudio, outputVideo, outputFile } = paths;

    const avdl = ffmpeg();
    avdl.setFfmpegPath(path);

    avdl.addInput(outputAudio) // audio
        .addInput(outputVideo) // video
        .format(FORMAT.MP4)
        .saveToFile(outputFile);

    avdl.on('error', (error) => {
        throw new Error(`ERROR_MERGE_VIDEO: ${error.message} - ${error.stack}`);
    });

    // avdl.on('start', (comand) => {
    //     console.log(`${comand}`);
    // });

    // avdl.on('progress', (progress) => {
    //     console.log(progress);
    // });

    avdl.on('end', async () => {
        try {
            console.log(`>> FINISHED`);
            await unlink(outputAudio);
            await unlink(outputVideo);
        } catch (error) {
            throw new Error(
                `ERROR_UNLINK_FILES: ${error.message} - ${error.stack}`
            );
        }
    });
};
