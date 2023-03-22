import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import * as uuid from 'uuid-random';
import { MoreVideoDetails } from 'ytdl-core';

const TEMP = 'temp';

export interface FilePathsTemp {
    outputAudio: string;
    outputVideo: string;
    outputFile: string;
    outputImage: string;
    outputText: string;
}

export const outputPaths = async (
    videoDetails: MoreVideoDetails
): Promise<FilePathsTemp> => {
    const { channelId, ownerChannelName, videoId, title } = videoDetails;

    const FOLDER_NAME = `${ownerChannelName}-${channelId}`.trim();

    const TEMP_FILE = `${FOLDER_NAME}/${TEMP}`.trim();
    const TEMP_FOLDER = join(OUTPUT_PATH, TEMP_FILE).trim();
    const FOLDER_PATH = join(OUTPUT_PATH, FOLDER_NAME).trim();

    if (!existsSync(TEMP_FOLDER)) await mkdir(TEMP_FOLDER, { recursive: true });

    const AUDIO_TEMPLATE_FILE = `audio=${uuid()}.${FORMAT.MP3}`.trim();
    const VIDEO_TEMPLATE_FILE = `video=${uuid()}.${FORMAT.MP4}`.trim();
    const IMAGE_TEMPLATE_FILE = `image=${uuid()}.${FORMAT.JPG}`.trim();
    const INFO_TEMPLATE_FILE = `info=${uuid()}.${FORMAT.TXT}`.trim();
    const FILE_TEMPLATE = `${title}-${videoId}.${FORMAT.MP4}`.trim();

    const outputAudio = join(TEMP_FOLDER, AUDIO_TEMPLATE_FILE).trim();
    const outputVideo = join(TEMP_FOLDER, VIDEO_TEMPLATE_FILE).trim();
    const outputImage = join(TEMP_FOLDER, IMAGE_TEMPLATE_FILE).trim();
    const outputText = join(TEMP_FOLDER, INFO_TEMPLATE_FILE).trim();
    const outputFile = join(FOLDER_PATH, FILE_TEMPLATE).trim();

    return { outputAudio, outputVideo, outputFile, outputImage, outputText };
};
