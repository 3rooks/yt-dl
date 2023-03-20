import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as uuid from 'uuid-random';
import { MoreVideoDetails } from 'ytdl-core';

export type InfoDocument = HydratedDocument<Info>;

@Schema({
    _id: false,
    timestamps: true,
    versionKey: false
})
export class Info {
    @Prop({ unique: true, default: () => uuid() })
    public readonly _id?: string;

    @Prop({ type: Object, required: true })
    public readonly videoDetails: MoreVideoDetails;
}

export const InfoSchema = SchemaFactory.createForClass(Info);
