import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClusterModule } from './config/cluster/cluster.module';
import { DatabaseModule } from './config/database/database.module';
import { CONFIG } from './constants/config';
import { DownloadModule } from './modules/download/download.module';
import { CompressorModule } from './modules/compressor/compressor.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClusterModule,
        DatabaseModule,
        DownloadModule,
        CompressorModule
    ]
})
export class AppModule {
    static port: number;
    constructor(private readonly config: ConfigService) {
        AppModule.port = this.config.get<number>(CONFIG.PORT);
    }
}
