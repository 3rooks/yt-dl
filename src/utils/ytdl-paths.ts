import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { OUTPUT_PATH, RANDOM_PATH } from 'src/utils/paths.resource';
import * as uuid from 'uuid-random';

const TEMP = 'temp';

interface FilePathsTemp {
    outputAudio: string;
    outputVideo: string;
    outputFile: string;
}

export const outputAudioVideoFilePath = async (
    videoDetails: IVideoInfo
): Promise<FilePathsTemp> => {
    const { channelId, channelTitle, videoId, title } = videoDetails;

    const FOLDER_NAME = `${channelTitle}-${channelId}`.trim();

    const TEMP_FILE = `${FOLDER_NAME}/${TEMP}`.trim();
    const TEMP_FOLDER = join(OUTPUT_PATH, TEMP_FILE).trim();
    const FOLDER_PATH = join(OUTPUT_PATH, FOLDER_NAME).trim();

    if (!existsSync(TEMP_FOLDER)) await mkdir(TEMP_FOLDER, { recursive: true });

    const AUDIO_TEMPLATE_FILE = `audio=${uuid()}.${FORMAT.MP3}`.trim();
    const VIDEO_TEMPLATE_FILE = `video=${uuid()}.${FORMAT.MP4}`.trim();
    const FILE_TEMPLATE = `${title}-${videoId}.${FORMAT.MP4}`.trim();

    const outputAudio = join(TEMP_FOLDER, AUDIO_TEMPLATE_FILE).trim();
    const outputVideo = join(TEMP_FOLDER, VIDEO_TEMPLATE_FILE).trim();
    const outputFile = join(FOLDER_PATH, FILE_TEMPLATE).trim();

    return { outputAudio, outputVideo, outputFile };
};

export const outputTextImagePath = async (
    channelInfo: IChannelInfo
): Promise<TxtAndImageOutput> => {
    const { name, channelId } = channelInfo;

    const FOLDER_NAME = `${name}-${channelId}`.trim();
    const TEMP_FILE = `${FOLDER_NAME}/${TEMP}`.trim();
    const TEMP_FOLDER = join(OUTPUT_PATH, TEMP_FILE).trim();

    if (!existsSync(TEMP_FOLDER)) await mkdir(TEMP_FOLDER, { recursive: true });

    const IMAGE_TEMPLATE_FILE = `image=${Date.now()}.${FORMAT.JPG}`.trim();
    const INFO_TEMPLATE_FILE = `info=${Date.now()}.${FORMAT.TXT}`.trim();

    const outputImage = join(TEMP_FOLDER, IMAGE_TEMPLATE_FILE).trim();
    const outputText = join(TEMP_FOLDER, INFO_TEMPLATE_FILE).trim();

    return { outputImage, outputText };
};

interface TxtAndImageOutput {
    outputImage: string;
    outputText: string;
}

export const outputAudioVideoFilePathRandom = async (
    videoDetails: IVideoInfo
): Promise<FilePathsTemp> => {
    const { channelId, channelTitle, videoId, title } = videoDetails;

    const FOLDER_NAME = `${channelTitle}-${channelId}`.trim();

    const TEMP_FILE = `${FOLDER_NAME}/${TEMP}`.trim();
    const TEMP_FOLDER = join(RANDOM_PATH, TEMP_FILE).trim();
    const FOLDER_PATH = join(RANDOM_PATH, FOLDER_NAME).trim();

    if (!existsSync(TEMP_FOLDER)) await mkdir(TEMP_FOLDER, { recursive: true });

    const AUDIO_TEMPLATE_FILE = `audio=${uuid()}.${FORMAT.MP3}`.trim();
    const VIDEO_TEMPLATE_FILE = `video=${uuid()}.${FORMAT.MP4}`.trim();
    const FILE_TEMPLATE = `${title}-${videoId}.${FORMAT.MP4}`.trim();

    const outputAudio = join(TEMP_FOLDER, AUDIO_TEMPLATE_FILE).trim();
    const outputVideo = join(TEMP_FOLDER, VIDEO_TEMPLATE_FILE).trim();
    const outputFile = join(FOLDER_PATH, FILE_TEMPLATE).trim();

    return { outputAudio, outputVideo, outputFile };
};
