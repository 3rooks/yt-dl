import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { FORMATS } from 'src/constants/video-formats';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import uuid from 'uuid-random';
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

        const AUDIO_TEMPLATE_FILE = `audio=${uuid()}.${FORMATS.MP3}`.trim();
        const VIDEO_TEMPLATE_FILE = `video=${uuid()}.${FORMATS.MP4}`.trim();
        const FILE_TEMPLATE = `${title}_${videoId}.${FORMATS.MP4}`
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

export const paths = (videoInfo: IVideoInfo, output: string) => {
    const { channelTitle, channelId, title, videoId } = videoInfo;

    const videoName = `${title}_${videoId}`;
    const folderName = `${channelTitle}_${channelId}`;

    const folderPath = join(output, folderName);
    const filePath = join(folderPath, videoName);

    return { videoName, folderName, filePath, folderPath };
};
