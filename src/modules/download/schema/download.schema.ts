import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DownloadDocument = HydratedDocument<Download>;

@Schema({
    timestamps: true,
    versionKey: false
})
export class Download {
    @Prop([String])
    link: string[];

    @Prop({ default: 'CHANNEL' })
    channel: string;
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
