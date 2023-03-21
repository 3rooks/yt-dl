import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MoreVideoDetails } from 'ytdl-core';

@Schema({ _id: false, versionKey: false })
export class DownloadItem {
    @Prop({ unique: true, required: true })
    public readonly videoId: string;

    @Prop({ unique: true, required: true })
    public readonly filePath: string;

    @Prop({ type: Object, required: true })
    public readonly videoDetails: VideoDetails;
}

export const DownloadItemSchema = SchemaFactory.createForClass(DownloadItem);

interface VideoDetails
    extends Omit<MoreVideoDetails, 'availableCountries' | 'author'> {}
