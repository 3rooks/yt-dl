import { Injectable, Logger } from '@nestjs/common';
import { readdirSync } from 'fs';
import { rm } from 'fs/promises';
import * as cron from 'node-cron';
import { OUTPUT_PATH } from './paths.resource';

@Injectable()
export class CleanFolderTask {
    private readonly folder = OUTPUT_PATH;
    private readonly logger = new Logger();

    constructor() {
        const cronTime = '0 0 * * *';

        const task = cron.schedule(cronTime, async () => {
            try {
                const files = readdirSync(this.folder);
                for (const file of files) {
                    if (file !== '.gitkeep') {
                        await rm(`${this.folder}/${file}`, {
                            recursive: true,
                            force: true
                        });
                    }
                }
            } catch (error) {
                this.logger.error(error.message);
            }
        });

        task.start();
    }
}
