import { path } from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import { resolve } from 'path';

const au = resolve(__dirname, '../../go.webm');
const vi = resolve(__dirname, '../../gov.mp4');

export const Down = async (link?: string) => {
    try {
        ffmpeg.setFfmpegPath(path);

        ffmpeg()
            .addInput(au) //audio
            .addInput(vi) //video
            .format('mp4')
            .saveToFile('ouput.mp4')
            .on('end', () => console.log('FINOSHHEEEED'));
    } catch (error) {
        throw new Error(`ERROR_DOWNLOAD: ${error.message} - ${error.stack}`);
    }
};
