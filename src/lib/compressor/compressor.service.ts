import { Inject, Injectable } from '@nestjs/common';
import { Archiver, EntryData } from 'archiver';
import { createWriteStream } from 'fs';
import { FORMATS } from 'src/constants/video-formats';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Exception } from 'src/utils/error/exception-handler';
import { OUTPUT_PATH } from 'src/utils/paths.resource';

const { ZIP } = FORMATS;
@Injectable()
export class CompressorService {
    private readonly folder = OUTPUT_PATH;

    constructor(
        @Inject('COMPRESSOR') private readonly createArchiver: () => Archiver,
        private readonly downloadGateway: DownloadGateway
    ) {}

    public async compressFolder(
        dest: string,
        dirPath: string,
        clientId: string
    ): Promise<void> {
        try {
            const archive = this.createArchiver();

            archive.pipe(createWriteStream(dest));
            archive.directory(dirPath, false);

            this.progress(clientId, archive);
            await archive.finalize();
        } catch (error) {
            throw Exception.catch(error.message);
        }
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
