import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { OUTPUT_PATH } from 'src/utils/paths.resource';

export const createFilePath = async (videoDetails: any): Promise<string> => {
    const folderPath = join(OUTPUT_PATH, `${videoDetails.author.name}`);
    if (!existsSync(folderPath)) await mkdir(folderPath);
    return folderPath;
};
