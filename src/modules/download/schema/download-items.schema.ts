import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TypeVideoDetails, TypeVideoDetailsSchema } from './video-details';

@Schema({ _id: false, versionKey: false })
export class DownloadItem {
    @Prop({ unique: true, required: true })
    public readonly videoId: string;

    @Prop({ unique: true, required: true })
    public readonly filePath: string;

    @Prop({ type: TypeVideoDetailsSchema, required: true })
    public readonly videoDetails: TypeVideoDetails;
}

export const DownloadItemSchema = SchemaFactory.createForClass(DownloadItem);
