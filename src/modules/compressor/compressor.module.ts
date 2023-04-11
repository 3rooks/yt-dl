import { Module } from '@nestjs/common';
import archiver, { Archiver } from 'archiver';
import { DownloadGatewayModule } from 'src/lib/websocket/download-gateway.module';
import { CompressorService } from './compressor.service';
@Module({
    imports: [DownloadGatewayModule],
    providers: [
        CompressorService,
        {
            provide: 'COMPRESSOR',
            useFactory: () => (): Archiver => {
                return archiver('zip', {
                    store: true,
                    zlib: {
                        level: 9
                    }
                });
            }
        }
    ],
    exports: [CompressorService]
})
export class CompressorModule {}
