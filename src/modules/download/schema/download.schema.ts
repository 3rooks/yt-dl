import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as uuid from 'uuid-random';
import { AuthorInfo, AuthorSchema } from './author-info.schema';
import { DownloadItem, DownloadItemSchema } from './download-items.schema';

export type DownloadDocument = HydratedDocument<Download>;

@Schema({ _id: false, timestamps: true, versionKey: false })
export class Download {
    @Prop({ unique: true, default: () => uuid() })
    public readonly _id?: string;

    @Prop({ unique: true, required: true })
    public readonly channelId: string;

    @Prop({ type: AuthorSchema, required: true })
    public readonly authorInfo: AuthorInfo;

    @Prop({ type: [DownloadItemSchema] })
    public readonly downloads?: DownloadItem[];
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
