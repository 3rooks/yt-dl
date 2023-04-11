import { Module } from '@nestjs/common';
import archiver from 'archiver';
import { DownloadGatewayModule } from 'src/lib/websocket/download-gateway.module';
import { CompressorService } from './compressor.service';
@Module({
    imports: [DownloadGatewayModule],
    providers: [
        CompressorService,
        {
            provide: 'COMPRESSOR',
            useFactory: () => {
                const archive = archiver('zip', {
                    store: true,
                    zlib: {
                        level: 9
                    }
                });
                return archive;
            }
        }
    ],
    exports: [CompressorService]
})
export class CompressorModule {}
