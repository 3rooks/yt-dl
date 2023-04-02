import { Module } from '@nestjs/common';
import * as archiver from 'archiver';
import { CompressorService } from './compressor.service';

const archive = archiver('zip', {
    store: true,
    zlib: {
        level: 9
    }
});

@Module({
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
