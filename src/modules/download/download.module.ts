import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InfoModule } from '../info/info.module';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { Download, DownloadSchema } from './schema/download.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Download.name,
                schema: DownloadSchema
            }
        ]),
        InfoModule
    ],
    controllers: [DownloadController],
    providers: [DownloadService]
})
export class DownloadModule {}
