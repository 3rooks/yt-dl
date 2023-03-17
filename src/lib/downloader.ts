import { createWriteStream, existsSync, WriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import {
    downloadFromInfo,
    getInfo,
    getVideoID,
    MoreVideoDetails,
    videoFormat,
    videoInfo
} from 'ytdl-core';
import { createFilePath } from './create-folder';
import { Down } from './download';
import { filterFormat } from './format-download';

interface Downloader {
    id: string;
    details: MoreVideoDetails;
    info: videoInfo;
    format: videoFormat;
    file: string;
}

export const downloader = async (url: string): Promise<Downloader> => {
    try {
        const id = getVideoID(url);
        const info = await getInfo(url);
        const format = filterFormat(info);
        const details = info.videoDetails;
        const file = await createFilePath(details, format);

        

        return {
            id,
            details,
            info,
            format,
            file
        };
    } catch (error) {
        throw new Error(`ERROR_DOWNLOAD: ${error.message} - ${error.stack}`);
    }
};

const createReadable = (info: videoInfo, format: videoFormat): Readable => {
    return downloadFromInfo(info, { format });
};
const createWriteable = (filePath: string): WriteStream => {
    console.log('FILEEEEEEEEEEEEEEEEEEEEEEEE', filePath);
    return createWriteStream(filePath);
};

const readAndWrite = async (
    info: videoInfo,
    format: videoFormat,
    file: string
) => {
    return await pipeline([
        createReadable(info, format),
        createWriteable(file)
    ]);
};
