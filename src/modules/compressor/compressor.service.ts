import { Inject, Injectable } from '@nestjs/common';
import { Archiver, EntryData } from 'archiver';
import { createWriteStream, statSync } from 'fs';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';

@Injectable()
export class CompressorService {
    constructor(
        @Inject('COMPRESSOR') private readonly archive: Archiver,
        private readonly downloadGateway: DownloadGateway
    ) {}

    async compressFolder(
        folderPath: string,
        channelName: string,
        outputFile: string,
        clientId: string
    ) {
        try {
            const fileName = `${channelName}.${FORMAT.ZIP}`;

            const outputZipFile = join(outputFile, fileName);
            const outputStream = createWriteStream(outputZipFile);

            this.archive.pipe(outputStream);
            this.archive.directory(folderPath, false);

            let totalSize = Math.round(
                statSync(folderPath).size / (1024 * 1024)
            );
            let processedBytes = 0;

            this.archive.on('data', (data: Buffer) => {
                processedBytes += data.length;
                const progress = Math.round(processedBytes / (1024 * 1024));
                this.downloadGateway.downloadChannelProgress(
                    clientId,
                    progress
                );
            });

            this.archive.on('finish', () => {
                this.downloadGateway.downloadChannelFinished(
                    clientId,
                    'Finished'
                );
            });

            await this.archive.finalize();

            return outputZipFile;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}
interface ExtendedEntryData extends EntryData {
    progressTotal?: number;
    progressAmount?: number;
}
