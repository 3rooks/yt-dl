import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IChannelInfo } from 'src/interfaces/channel-info.interface';

@Schema({ _id: false, versionKey: false })
export class ChannelInfo implements IChannelInfo {
    @Prop()
    public readonly kind: string;

    @Prop()
    public readonly channelId: string;

    @Prop()
    public readonly name: string;

    @Prop()
    public readonly user: string;

    @Prop()
    public readonly channel_url: string;

    @Prop({ required: true })
    public readonly user_url: string;

    @Prop()
    public readonly description: string;

    @Prop()
    public readonly thumbnails: {
        url: string;
        width: number;
        height: number;
    }[];

    @Prop()
    public readonly video_count: number;

    @Prop()
    public readonly subscriber_count: number;
}

export const ChannelInfoSchema = SchemaFactory.createForClass(ChannelInfo);
