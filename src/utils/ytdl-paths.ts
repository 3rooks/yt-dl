import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import * as uuid from 'uuid-random';
import { Exception } from './error/exception-handler';

const TEMP = 'temp';

interface FilePathsTemp {
    outputPath: string;
    outputAudio: string;
    outputVideo: string;
    outputFile: string;
}

export const outputAudioVideoFilePath = async (
    videoInfo: IVideoInfo,
    outputFolder: string
): Promise<FilePathsTemp> => {
    try {
        const { channelId, channelTitle, videoId, title } = videoInfo;

        const FOLDER_NAME = `${channelTitle}_${channelId}`
            .replace(/[/\\?%*:|"<>]/g, '')
            .trim();

        const FOLDER_PATH = join(outputFolder, FOLDER_NAME).trim();

        if (!existsSync(FOLDER_PATH))
            await mkdir(FOLDER_PATH, { recursive: true });

        const AUDIO_TEMPLATE_FILE = `audio=${uuid()}.${FORMAT.MP3}`.trim();
        const VIDEO_TEMPLATE_FILE = `video=${uuid()}.${FORMAT.MP4}`.trim();
        const FILE_TEMPLATE = `${title}_${videoId}.${FORMAT.MP4}`
            .replace(/[<>:"/\\|?*\x00-\x1F]+/g, '') // removes disallowed character
            .normalize('NFD') // unicode characters into separate characters
            .replace(/[\u0300-\u036f]/g, '') // removes diacritics
            .replace(/[^\w\dа-яА-Я.\s]/g, '') // removes unwanted characters, except spaces
            .trim();

        const outputAudio = join(FOLDER_PATH, AUDIO_TEMPLATE_FILE).trim();
        const outputVideo = join(FOLDER_PATH, VIDEO_TEMPLATE_FILE).trim();
        const outputFile = join(FOLDER_PATH, FILE_TEMPLATE).trim();

        return {
            outputPath: FOLDER_PATH,
            outputAudio,
            outputVideo,
            outputFile
        };
    } catch (error) {
        throw Exception.catch(error.message);
    }
};

export const outputTextImagePath = async (
    channelInfo: IChannelInfo,
    outputFolder: string
): Promise<TxtAndImageOutput> => {
    const { name, channelId } = channelInfo;

    const FOLDER_NAME = `${name}_${channelId}`
        .replace(/[/\\?%*:|"<>]/g, '')
        .trim();
    const TEMP_FILE = `${FOLDER_NAME}/${TEMP}`.trim();
    const TEMP_FOLDER = join(outputFolder, TEMP_FILE).trim();

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
