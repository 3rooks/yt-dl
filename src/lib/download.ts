import { path } from '@ffmpeg-installer/ffmpeg';
// import ffprobe from '@ffprobe-installer/ffprobe';
import * as ffmpeg from 'fluent-ffmpeg';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import * as ytdl from 'ytdl-core';

export const Down = (link: string) => {
    try {
        ffmpeg.setFfmpegPath(path);
        // setFfprobePath(ffprobe.path);

        const audio = ytdl(link, { filter: 'audioonly' });
        const video = ytdl(link, { filter: 'videoonly' });

        ffmpeg()
            .addInput(audio)
            .addInput(
                OUTPUT_PATH + '/ Ангелина топ 👍/Пикачу 🐱-FaHDgqXiDJ4.mp4'
            )
            .format('mp4')
            .saveToFile('ouput.mp4')
            .on('end', () => console.log('FINOSHHEEEED'));
    } catch (error) {
        throw new Error(`ERROR_DOWNLOAD: ${error.message} - ${error.stack}`);
    }
};
