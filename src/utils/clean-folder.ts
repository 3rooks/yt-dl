import { Injectable, Logger } from '@nestjs/common';
import { readdirSync } from 'fs';
import { unlink } from 'fs/promises';
import * as cron from 'node-cron';
import { OUTPUT_PATH } from './paths.resource';

@Injectable()
export class CleanFolderTask {
    private readonly folderPath = OUTPUT_PATH;
    private readonly logger = new Logger();

    constructor() {
        const cronTime = '0 */12 * * *';

        const task = cron.schedule(cronTime, async () => {
            try {
                const files = readdirSync(this.folderPath);
                for (const file of files) {
                    if (file !== '.gitkeep') {
                        await unlink(`${this.folderPath}/${file}`);
                    }
                }
            } catch (error) {
                this.logger.error(error.message);
            }
        });

        task.start();
    }
}
