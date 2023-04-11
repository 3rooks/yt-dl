import { Inject, Injectable } from '@nestjs/common';
import { Archiver, EntryData } from 'archiver';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { FORMAT } from 'src/constants/video-formats';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import uuid from 'uuid-random';

@Injectable()
export class CompressorService {
    private readonly folder = OUTPUT_PATH;

    constructor(
        @Inject('COMPRESSOR') private readonly createArchiver: () => Archiver,
        private readonly downloadGateway: DownloadGateway
    ) {}

    public async compressFolder(folderTo: string, clientId: string) {
        try {
            const archive = this.createArchiver();

            const { outputStream, outputFilePath } = this.paths();

            archive.pipe(outputStream);
            archive.directory(folderTo, false);

            this.progress(clientId, archive);

            await archive.finalize();

            return outputFilePath;
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    private paths() {
        const fileTemplate = `${uuid()}.${FORMAT.ZIP}`;
        const outputFilePath = join(this.folder, fileTemplate);
        const outputStream = createWriteStream(outputFilePath);

        return {
            outputStream,
            outputFilePath
        };
    }

    private progress(clientId: string, archive: Archiver) {
        let processedBytes = 0;
        let totalBytes = 0;

        archive.on('entry', (entry: EntryData) => {
            totalBytes += entry.stats.size;
        });

        archive.on('data', (data: Buffer) => {
            processedBytes += data.length;
            const progress = Math.round((processedBytes / totalBytes) * 100);
            this.downloadGateway.downloadChannelProgress(clientId, progress);
        });

        archive.on('finish', () => {
            this.downloadGateway.downloadChannelFinished(clientId);
        });
    }
}
