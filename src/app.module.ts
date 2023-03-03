import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './config/database/database.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        DatabaseModule
    ]
})
export class AppModule {
    static port: number;
    constructor(private readonly config: ConfigService) {
        AppModule.port = this.config.get<number>('PORT');
    }
}
