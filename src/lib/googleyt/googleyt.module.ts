import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { CONFIG } from 'src/constants/config';
import { GoogleapiService } from './googleyt.service';

@Module({
    providers: [
        GoogleapiService,
        {
            provide: 'YOUTUBE_API',
            useFactory: (configService: ConfigService) => {
                const youtube = google.youtube({
                    version: 'v3',
                    auth: configService.get<string>(CONFIG.GOOGLE_KEY)
                });
                return youtube;
            },
            inject: [ConfigService]
        }
    ],
    exports: [GoogleapiService]
})
export class GoogleapiModule {}
