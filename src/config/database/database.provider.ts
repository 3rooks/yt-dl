import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG } from 'src/constants/config';

export const DatabaseProvider: DynamicModule = MongooseModule.forRootAsync({
    useFactory: async (config: ConfigService) => ({
        uri: config.get<string>(CONFIG.DB_URI)
    }),
    inject: [ConfigService]
});
