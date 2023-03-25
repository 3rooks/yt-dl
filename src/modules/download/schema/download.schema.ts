import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { Downloads } from 'src/interfaces/downloads.interface';
import * as uuid from 'uuid-random';

export type DownloadDocument = HydratedDocument<Download>;

@Schema({ _id: false, timestamps: true, versionKey: false })
export class Download {
    @Prop({ unique: true, default: () => uuid() })
    public readonly _id?: string;

    @Prop({ unique: true, required: true })
    public readonly id: string;

    @Prop({ type: Object, required: true })
    public readonly channelInfo: IChannelInfo;

    @Prop({ type: Array<Downloads> })
    public readonly downloads?: Downloads[];
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
