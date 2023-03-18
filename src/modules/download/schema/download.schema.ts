import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Info } from 'src/modules/info/schema/info.schema';
import * as uuid from 'uuid-random';
import { MoreVideoDetails, videoFormat } from 'ytdl-core';

export type DownloadDocument = HydratedDocument<Download>;

@Schema({
    _id: false,
    timestamps: true,
    versionKey: false
})
export class Download {
    @Prop({ unique: true, default: () => uuid() })
    public readonly _id?: string;

    @Prop({ unique: true, required: true })
    public readonly id: string;

    @Prop({ type: Object, required: true })
    public readonly details: MoreVideoDetails;

    @Prop({ ref: Info.name, required: true })
    public readonly info: string;

    @Prop({ unique: true, required: true })
    public readonly file: string;
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
