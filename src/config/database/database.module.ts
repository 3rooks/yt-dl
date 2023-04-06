import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG } from 'src/constants/config';
import { MODELS } from 'src/constants/models';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>(CONFIG.DB_URI),
                useNewUrlParser: true,
                useUnifiedTopology: true
            }),
            inject: [ConfigService]
        }),
        MongooseModule.forFeature(MODELS)
    ],
    exports: [MongooseModule]
})
export class DatabaseModule {}
