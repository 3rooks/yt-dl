import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { VideoInfo, VideoInfoSchema } from './video-details';

@Schema({ _id: false, versionKey: false })
export class VideoDownload {
    @Prop({ unique: true, required: true })
    public readonly videoId: string;

    @Prop({ unique: true, required: true })
    public readonly filePath: string;

    @Prop({ type: VideoInfoSchema, required: true })
    public readonly videoDetails: VideoInfo;
}

export const VideoDownloadSchema = SchemaFactory.createForClass(VideoDownload);
