import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { MoreVideoDetails, videoFormat } from 'ytdl-core';

export const createFilePath = async (
    videoDetails: MoreVideoDetails,
    format: videoFormat
): Promise<string> => {
    const folderPath = join(OUTPUT_PATH, `${videoDetails.author.name}`);
    if (!existsSync(folderPath)) await mkdir(folderPath);
    const videoTemplate = `${videoDetails.title}-${videoDetails.videoId}.${format.container}`;
    return join(folderPath, videoTemplate);
};
