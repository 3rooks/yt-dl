import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as uuid from 'uuid-random';
import { ChannelInfo, ChannelInfoSchema } from './channel-info.schema';
import { VideoDownload, VideoDownloadSchema } from './video-download.schema';

export type DownloadDocument = HydratedDocument<Download>;

@Schema({ _id: false, timestamps: true, versionKey: false })
export class Download {
    @Prop({ unique: true, default: () => uuid() })
    public readonly _id?: string;

    @Prop({ unique: true, required: true })
    public readonly id: string;

    @Prop({ type: ChannelInfoSchema, required: true })
    public readonly channelInfo: ChannelInfo;

    @Prop({ type: [VideoDownloadSchema] })
    public readonly downloads?: VideoDownload[];
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
