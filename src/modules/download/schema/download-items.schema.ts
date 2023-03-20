import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Info } from 'src/modules/info/schema/info.schema';

@Schema({ _id: false, versionKey: false })
export class DownloadItem {
    @Prop({ unique: true, required: true })
    public readonly videoId: string;

    @Prop({ unique: true, required: true })
    public readonly filePath: string;

    @Prop({ type: String, ref: Info.name, required: true })
    public readonly videoDetails: string;
}

export const DownloadItemSchema = SchemaFactory.createForClass(DownloadItem);
