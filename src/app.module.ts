import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './config/database/database.module';
import { CONFIG } from './constants/config';
import { DownloadModule } from './modules/download/download.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        DownloadModule
    ]
})
export class AppModule {
    static port: number;
    constructor(private readonly config: ConfigService) {
        AppModule.port = this.config.get<number>(CONFIG.PORT);
    }
}
