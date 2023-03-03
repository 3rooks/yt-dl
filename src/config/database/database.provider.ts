import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const DatabaseProvider: DynamicModule = MongooseModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('DB_URI')
    })
});
