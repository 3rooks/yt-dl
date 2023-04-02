import { Inject, Injectable } from '@nestjs/common';
import { Archiver } from 'archiver';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';

@Injectable()
export class CompressorService {
    constructor(@Inject('COMPRESSOR') private readonly archive: Archiver) {}

    async compressFolder(folderPath: string, channelName: string) {
        const outputZipFile = join(folderPath, `${channelName}.${FORMAT.ZIP}`);
        const outputStream = createWriteStream(outputZipFile);

        this.archive.pipe(outputStream);
        this.archive.directory(folderPath, false);
        await this.archive.finalize();

        return outputZipFile;
    }
}
