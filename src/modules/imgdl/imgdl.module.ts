import { Module } from '@nestjs/common';
import * as imgdl from 'image-downloader';

@Module({
    providers: [
        {
            provide: 'IMGDL',
            useValue: imgdl
        }
    ],
    exports: ['IMGDL']
})
export class ImgdlModule {}
