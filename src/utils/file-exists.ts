import { constants } from 'fs';
import { access } from 'fs/promises';

export const fileExists = async (filePath: string): Promise<boolean> => {
    try {
        await access(filePath, constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
};
