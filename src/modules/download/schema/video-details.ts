import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IVideoInfo } from 'src/interfaces/video-info.interface';

@Schema({
    _id: false,
    versionKey: false
})
export class VideoInfo implements IVideoInfo {
    @Prop({ required: true })
    public readonly kind: string;

    @Prop({ unique: true, required: true })
    public readonly videoId: string;

    @Prop({ unique: true, required: true })
    public readonly channelId: string;

    @Prop({ required: true })
    public readonly channelTitle: string;

    @Prop({ required: true })
    public readonly title: string;

    @Prop({ required: true })
    public readonly description: string;

    @Prop({ required: true })
    public readonly upload: string;

    @Prop({ unique: true, required: true })
    public readonly embed: string;

    @Prop({ unique: true, required: true })
    public readonly videoUrl: string;
}

export const VideoInfoSchema = SchemaFactory.createForClass(VideoInfo);
