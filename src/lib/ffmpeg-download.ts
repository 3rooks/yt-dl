import { path } from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import { createWriteStream } from 'fs';
// import { unlink } from 'fs/promises';
import { EventEmitter } from 'events';
import { FORMAT } from 'src/constants/video-formats';
import { FilePathsTemp } from './ytdl-paths';

export const eve = new EventEmitter();

export const ffmpegDownloader = async (paths: FilePathsTemp) => {
    try {
        const { outputAudio, outputVideo, outputFile } = paths;

        ffmpeg.setFfmpegPath(path);

        const out = createWriteStream(outputFile);

        ffmpeg()
            .addInput(outputAudio) // audio
            .addInput(outputVideo) // video
            .format(FORMAT.MP4)
            .saveToFile(outputFile)
            .on('error', (err) => console.log(err))
            .on('end', () => {
                eve.emit('ended', outputFile);
                console.log('finish successfully');
            })
            .on('progress', (progress) => console.log(progress));

        // await unlink(outputAudio);
        // await unlink(outputVideo);
    } catch (error) {
        throw new Error(`ERROR_FFMPEG: ${error.message} - ${error.stack}`);
    }
};
