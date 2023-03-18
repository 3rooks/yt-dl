import { createWriteStream } from 'fs';
import { QUALITIES } from 'src/constants/qualities';
import { pipeline } from 'stream/promises';
import * as ytdl from 'ytdl-core';
import { FilePathsTemp, outputPaths } from './ytdl-paths';

export const ytdlDownloader = async (
    info: ytdl.videoInfo
): Promise<FilePathsTemp> => {
    try {
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        const videoFormats = ytdl.filterFormats(info.formats, 'videoonly');

        const audioFormat = ytdl.chooseFormat(audioFormats, {
            quality: QUALITIES.HIGHESTAUDIO
        });
        const videoFormat = ytdl.chooseFormat(videoFormats, {
            quality: QUALITIES.HIGHESTVIDEO
        });

        const { outputAudio, outputVideo } = await outputPaths(
            info,
            audioFormat,
            videoFormat
        );

        const audioReadable = ytdl.downloadFromInfo(info, {
            format: audioFormat
        });
        const audioWriteable = createWriteStream(outputAudio);

        const videoReadable = ytdl.downloadFromInfo(info, {
            format: videoFormat
        });
        const videoWriteable = createWriteStream(outputVideo);

        await pipeline([audioReadable, audioWriteable]);
        await pipeline([videoReadable, videoWriteable]);

        return { outputAudio, outputVideo };
    } catch (error) {
        throw new Error(`ERROR_YTDL: ${error.message} - ${error.stack}`);
    }
};

// const audio = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }).pipe(createWriteStream('audio.webm'))
// const video = ytdl(url, { filter: 'videoonly', quality: 'highestvideo' }).pipe(createWriteStream('video.mp4'))
