import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    Chapter,
    Media,
    MoreVideoDetails,
    storyboard,
    thumbnail
} from 'ytdl-core';

@Schema({
    _id: false,
    versionKey: false
})
export class TypeVideoDetails
    implements Omit<MoreVideoDetails, 'availableCountries' | 'author'>
{
    @Prop({ type: Array })
    thumbnails: thumbnail[];

    @Prop({ type: Object })
    thumbnail: { thumbnails: thumbnail[] };

    @Prop({ type: Array })
    storyboards: storyboard[];

    @Prop({ type: Object })
    media: Media;

    @Prop({ type: Array })
    chapters: Chapter[];

    @Prop()
    isPrivate: boolean;

    @Prop()
    likes: number;

    @Prop()
    isLiveContent: boolean;

    @Prop()
    lengthSeconds: string;

    @Prop()
    uploadDate: string;

    @Prop()
    published: number;

    @Prop()
    ownerChannelName: string;

    @Prop()
    ownerGplusProfileUrl?: string;

    @Prop()
    isUnpluggedCorpus: boolean;

    @Prop()
    videoId: string;

    @Prop()
    publishDate: string;

    @Prop()
    keywords?: string[];

    @Prop()
    ownerProfileUrl: string;

    @Prop()
    video_url: string;

    @Prop()
    title: string;

    @Prop()
    isFamilySafe: boolean;

    @Prop()
    isUnlisted: boolean;

    @Prop()
    isOwnerViewing: boolean;

    @Prop({ type: Object })
    liveBroadcastDetails?: {
        isLiveNow: boolean;
        startTimestamp: string;
        endTimestamp?: string;
    };

    @Prop()
    viewCount: string;

    @Prop()
    isCrawlable: boolean;

    @Prop()
    hasYpcMetadata: boolean;

    @Prop()
    externalChannelId: string;

    @Prop({ type: Object })
    embed: {
        iframeUrl: string;
        flashUrl: string;
        width: number;
        height: number;
        flashSecureUrl: string;
    };

    @Prop()
    dislikes: number;

    @Prop()
    description: string;

    @Prop()
    channelId: string;

    @Prop()
    category: string;

    @Prop()
    averageRating: number;

    @Prop()
    allowRatings: boolean;

    @Prop()
    age_restricted: boolean;
}

export const TypeVideoDetailsSchema =
    SchemaFactory.createForClass(TypeVideoDetails);
