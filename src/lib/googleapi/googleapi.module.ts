import { Module } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleapiService } from './googleapi.service';

@Module({
    providers: [
        GoogleapiService,
        {
            provide: 'GOOGLE',
            useValue: google
        }
    ],
    exports: [GoogleapiService]
})
export class GoogleapiModule {}
