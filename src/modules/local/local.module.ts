import { Module } from '@nestjs/common';
import { CompressorModule } from 'src/lib/compressor/compressor.module';
import { GoogleapiModule } from 'src/lib/googleapis/googleapis.module';
import { YoutubeDlModule } from 'src/lib/youtube-dl/youtubedl.module';
import { LocalController } from './local.controller';
import { LocalService } from './local.service';

@Module({
    imports: [CompressorModule, GoogleapiModule, YoutubeDlModule],
    controllers: [LocalController],
    providers: [LocalService]
})
export class LocalModule {}
