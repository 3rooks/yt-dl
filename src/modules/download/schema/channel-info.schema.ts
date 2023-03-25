import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';

@Schema({ _id: false, versionKey: false })
export class ChannelInfo implements IChannelInfo {
    @Prop({ required: true })
    public readonly kind: string;

    @Prop({ unique: true, required: true })
    public readonly channelId: string;

    @Prop({ required: true })
    public readonly name: string;

    @Prop({ required: true })
    public readonly user: string | undefined;

    @Prop({ required: true })
    public readonly channel_url: string;

    @Prop({ required: true })
    public readonly user_url: string;

    @Prop({ required: true })
    public readonly description: string;

    @Prop({ required: true })
    public readonly thumbnails: {
        default: {
            url: string;
            width: number;
            height: number;
        };
        medium: {
            url: string;
            width: number;
            height: number;
        };
        high: {
            url: string;
            width: number;
            height: number;
        };
    };

    @Prop({ required: true })
    public readonly video_count: number;

    @Prop({ required: true })
    public readonly subscriber_count: number;
}

export const ChannelInfoSchema = SchemaFactory.createForClass(ChannelInfo);
