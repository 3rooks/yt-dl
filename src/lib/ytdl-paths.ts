import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { videoFormat, videoInfo } from 'ytdl-core';

const TEMP = 'temp';

export interface FilePathsTemp {
    outputAudio: string;
    outputVideo: string;
}

export const outputPaths = async (
    info: videoInfo,
    audioFormat: videoFormat,
    videoFormat: videoFormat
): Promise<FilePathsTemp> => {
    const { videoDetails } = info;

    const FOLDER_NAME = `${videoDetails.author.name}`.trim();

    const TEMP_FILE = `${FOLDER_NAME}/${TEMP}`.trim();
    const FOLDER_PATH = join(OUTPUT_PATH, TEMP_FILE).trim();

    if (!existsSync(FOLDER_PATH)) await mkdir(FOLDER_PATH, { recursive: true });

    const AUDIO_TEMPLATE_FILE =
        `audio=${videoDetails.title}-${videoDetails.videoId}.${audioFormat.container}`.trim();
    const VIDEO_TEMPLATE_FILE =
        `video=${videoDetails.title}-${videoDetails.videoId}.${videoFormat.container}`.trim();

    const outputAudio = join(FOLDER_PATH, AUDIO_TEMPLATE_FILE).trim();
    const outputVideo = join(FOLDER_PATH, VIDEO_TEMPLATE_FILE).trim();

    return { outputAudio, outputVideo };
};
