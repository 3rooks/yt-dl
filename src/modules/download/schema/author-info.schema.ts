import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Author, thumbnail } from 'ytdl-core';

@Schema({ _id: false })
export class AuthorInfo implements Author {
    @Prop()
    public readonly id: string;

    @Prop()
    public readonly name: string;

    @Prop()
    public readonly user?: string;

    @Prop()
    public readonly channel_url: string;

    @Prop()
    public readonly user_url?: string;

    @Prop()
    public readonly thumbnails?: thumbnail[];

    @Prop()
    public readonly verified: boolean;

    @Prop()
    public readonly subscriber_count?: number;

    @Prop()
    public readonly external_channel_url?: string;

    @Prop()
    public readonly avatar: string;
}

export const AuthorSchema = SchemaFactory.createForClass(AuthorInfo);
