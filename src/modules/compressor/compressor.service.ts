import { Inject, Injectable } from '@nestjs/common';
import { Archiver } from 'archiver';
import { createWriteStream } from 'fs';
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

            let compressedBytes = 0;
            const totalSize = this.archive.pointer() / (1024 * 1024); // Obtener tamaño total del archivo comprimido

            this.archive.on('data', (chunk: Buffer) => {
                compressedBytes += chunk.length; // Actualizar la cantidad de bytes comprimidos
                const compressedMB = Math.round(
                    compressedBytes / (1024 * 1024)
                );
                const progressPayload = {
                    progress: compressedMB,
                    totalSize: totalSize
                };
                this.downloadGateway.downloadChannelProgress(
                    clientId,
                    progressPayload
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
