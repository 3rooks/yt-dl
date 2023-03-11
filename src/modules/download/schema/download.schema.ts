import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
    Author,
    Chapter,
    Media,
    MoreVideoDetails,
    storyboard,
    thumbnail
} from 'ytdl-core';

export type DownloadDocument = HydratedDocument<Download>;

@Schema({
    timestamps: true,
    versionKey: false
})
export class Download implements MoreVideoDetails {
    @Prop({ type: Object })
    embed: {
        iframeUrl: string;
        flashUrl: string;
        width: number;
        height: number;
        flashSecureUrl: string;
    };

    @Prop()
    title: string;

    @Prop()
    lengthSeconds: string;

    @Prop()
    ownerProfileUrl: string;

    @Prop()
    externalChannelId: string;

    @Prop()
    isFamilySafe: boolean;

    @Prop()
    availableCountries: string[];

    @Prop()
    isUnlisted: boolean;

    @Prop()
    hasYpcMetadata: boolean;

    @Prop()
    viewCount: string;

    @Prop()
    category: string;

    @Prop()
    publishDate: string;

    @Prop()
    ownerChannelName: string;

    @Prop()
    uploadDate: string;

    @Prop({ unique: true })
    videoId: string;

    @Prop()
    channelId: string;

    @Prop()
    isOwnerViewing: boolean;

    @Prop()
    isCrawlable: boolean;

    @Prop()
    allowRatings: boolean;

    @Prop({ type: Object })
    author: Author;

    @Prop()
    isPrivate: boolean;

    @Prop()
    isUnpluggedCorpus: boolean;

    @Prop()
    isLiveContent: boolean;

    @Prop({ type: Object })
    media: Media;

    @Prop()
    likes: number | null;

    @Prop()
    dislikes: number | null;

    @Prop()
    age_restricted: boolean;

    @Prop()
    video_url: string;

    @Prop()
    storyboards: storyboard[];

    @Prop()
    chapters: Chapter[];

    @Prop({ type: Object })
    thumbnail: { thumbnails: thumbnail[] };

    @Prop()
    description: string | null;

    @Prop()
    thumbnails: thumbnail[];

    @Prop()
    averageRating: number;

    @Prop()
    published: number;

    @Prop()
    ownerGplusProfileUrl?: string;

    @Prop({ type: Object })
    liveBroadcastDetails?: {
        isLiveNow: boolean;
        startTimestamp: string;
        endTimestamp?: string;
    };

    @Prop()
    keywords?: string[];

    // My props
    @Prop({ unique: true })
    file: string;
}

export const DownloadSchema = SchemaFactory.createForClass(Download);
