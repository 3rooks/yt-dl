import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import * as uuid from 'uuid-random';
import { videoFormat, videoInfo } from 'ytdl-core';

const TEMP = 'temp';

export interface FilePathsTemp {
    outputAudio: string;
    outputVideo: string;
    outputFile: string;
}

export const outputPaths = async (
    info: videoInfo,
    audioFormat: videoFormat,
    videoFormat: videoFormat
): Promise<FilePathsTemp> => {
    const { videoDetails } = info;
    const { channelId, ownerChannelName, videoId, title } = videoDetails;
    const { container: audioExt } = audioFormat;
    const { container: videoExt } = videoFormat;

    const FOLDER_NAME = `${ownerChannelName}-${channelId}`.trim();

    const TEMP_FILE = `${FOLDER_NAME}/${TEMP}`.trim();
    const TEMP_FOLDER = join(OUTPUT_PATH, TEMP_FILE).trim();
    const FOLDER_PATH = join(OUTPUT_PATH, FOLDER_NAME).trim();

    if (!existsSync(TEMP_FOLDER)) await mkdir(TEMP_FOLDER, { recursive: true });
    await writeFile(
        `${TEMP_FOLDER}/info-${Date.now()}.json`,
        JSON.stringify(videoDetails.author, null, 4),
        { encoding: 'utf8' }
    );

    const AUDIO_TEMPLATE_FILE = `audio=${uuid()}.${audioExt}`.trim();
    const VIDEO_TEMPLATE_FILE = `video=${uuid()}.${videoExt}`.trim();
    const FILE_TEMPLATE = `${title}-${videoId}.${FORMAT.MP4}`.trim();

    const outputAudio = join(TEMP_FOLDER, AUDIO_TEMPLATE_FILE).trim();
    const outputVideo = join(TEMP_FOLDER, VIDEO_TEMPLATE_FILE).trim();
    const outputFile = join(FOLDER_PATH, FILE_TEMPLATE).trim();

    return { outputAudio, outputVideo, outputFile };
};
