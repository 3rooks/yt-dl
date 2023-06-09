import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { ClusterModule } from './config/cluster/cluster.module';
import { CONFIG } from './constants/config';
import { DownloadModule } from './modules/download/download.module';
import { LocalModule } from './modules/local/local.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClusterModule,
        DownloadModule,
        LocalModule
    ],
    controllers: [AppController]
})
export class AppModule {
    static port: number;
    constructor(private readonly config: ConfigService) {
        AppModule.port = this.config.get<number>(CONFIG.PORT);
    }
}
