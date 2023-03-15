import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InfoService } from './info.service';
import { Info, InfoSchema } from './schema/info.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Info.name,
                schema: InfoSchema
            }
        ])
    ],
    controllers: [],
    providers: [InfoService],
    exports: [InfoService]
})
export class InfoModule {}
