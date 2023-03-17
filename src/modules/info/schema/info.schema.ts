import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as uuid from 'uuid-random';
// import {
//     audioTrack,
//     captionTrack,
//     MicroformatRenderer,
//     MoreVideoDetails,
//     relatedVideo,
//     translationLanguage,
//     VideoDetails,
//     videoFormat,
//     videoInfo
// } from 'ytdl-core';

export type InfoDocument = HydratedDocument<Info>;

@Schema({
    _id: false,
    timestamps: true,
    versionKey: false
})
export class Info {
    @Prop({ unique: true, default: () => uuid() })
    _id?: string;

    @Prop()
    iv_load_policy?: string;

    @Prop()
    iv_allow_in_place_switch?: string;

    @Prop()
    iv_endscreen_url?: string;

    @Prop()
    iv_invideo_url?: string;

    @Prop()
    iv3_module?: string;

    @Prop()
    rmktEnabled?: string;

    @Prop()
    uid?: string;

    @Prop()
    vid?: string;

    @Prop()
    focEnabled?: string;

    @Prop()
    baseUrl?: string;

    @Prop()
    storyboard_spec?: string;

    @Prop()
    serialized_ad_ux_config?: string;

    @Prop()
    player_error_log_fraction?: string;

    @Prop()
    sffb?: string;

    @Prop()
    ldpj?: string;

    @Prop()
    videostats_playback_base_url?: string;

    @Prop()
    innertube_context_client_version?: string;

    @Prop()
    t?: string;

    @Prop()
    fade_in_start_milliseconds: string;

    @Prop()
    timestamp: string;

    @Prop()
    ad3_module: string;

    @Prop()
    relative_loudness: string;

    @Prop()
    allow_below_the_player_companion: string;

    @Prop()
    eventid: string;

    @Prop()
    token: string;

    @Prop()
    atc: string;

    @Prop()
    cr: string;

    @Prop()
    apply_fade_on_midrolls: string;

    @Prop()
    cl: string;

    @Prop()
    fexp: string[];

    @Prop()
    apiary_host: string;

    @Prop()
    fade_in_duration_milliseconds: string;

    @Prop()
    fflags: string;

    @Prop()
    ssl: string;

    @Prop()
    pltype: string;

    @Prop()
    enabled_engage_types: string;

    @Prop()
    hl: string;

    @Prop()
    is_listed: string;

    @Prop()
    gut_tag: string;

    @Prop()
    apiary_host_firstparty: string;

    @Prop()
    enablecsi: string;

    @Prop()
    csn: string;

    @Prop()
    status: string;

    @Prop()
    afv_ad_tag: string;

    @Prop()
    idpj: string;

    @Prop()
    sfw_player_response: string;

    @Prop()
    account_playback_token: string;

    @Prop()
    encoded_ad_safety_reason: string;

    @Prop()
    tag_for_children_directed: string;

    @Prop()
    no_get_video_log: string;

    @Prop()
    ppv_remarketing_url: string;

    @Prop()
    fmt_list: string[][];

    @Prop()
    ad_slots: string;

    @Prop()
    fade_out_duration_milliseconds: string;

    @Prop()
    instream_long: string;

    @Prop()
    allow_html5_ads: string;

    @Prop()
    core_dbp: string;

    @Prop()
    ad_device: string;

    @Prop()
    itct: string;

    @Prop()
    root_ve_type: string;

    @Prop()
    excluded_ads: string;

    @Prop()
    aftv: string;

    @Prop()
    loeid: string;

    @Prop()
    cver: string;

    @Prop()
    shortform: string;

    @Prop()
    dclk: string;

    @Prop()
    csi_page_type: string;

    @Prop()
    ismb: string;

    @Prop()
    gpt_migration: string;

    @Prop()
    loudness: string;

    @Prop()
    ad_tag: string;

    @Prop()
    of: string;

    @Prop()
    probe_url: string;

    @Prop()
    vm: string;

    @Prop()
    afv_ad_tag_restricted_to_instream: string;

    @Prop()
    gapi_hint_params: string;

    @Prop()
    cid: string;

    @Prop()
    c: string;

    @Prop()
    oid: string;

    @Prop()
    ptchn: string;

    @Prop()
    as_launched_in_country: string;

    @Prop()
    avg_rating: string;

    @Prop()
    fade_out_start_milliseconds: string;

    @Prop()
    midroll_prefetch_size: string;

    @Prop()
    allow_ratings: string;

    @Prop()
    thumbnail_url: string;

    @Prop()
    iurlsd: string;

    @Prop()
    iurlmq: string;

    @Prop()
    iurlhq: string;

    @Prop()
    iurlmaxres: string;

    @Prop()
    ad_preroll: string;

    @Prop()
    tmi: string;

    @Prop()
    trueview: string;

    @Prop()
    host_language: string;

    @Prop()
    innertube_api_key: string;

    @Prop()
    show_content_thumbnail: string;

    @Prop()
    afv_instream_max: string;

    @Prop()
    innertube_api_version: string;

    @Prop()
    mpvid: string;

    @Prop()
    allow_embed: string;

    @Prop()
    ucid: string;

    @Prop()
    plid: string;

    @Prop()
    midroll_freqcap: string;

    @Prop()
    ad_logging_flag: string;

    @Prop()
    ptk: string;

    @Prop()
    vmap: string;

    @Prop()
    watermark: string[];

    @Prop()
    dbp: string;

    @Prop()
    ad_flags: string;

    @Prop()
    html5player: string;

    // @Prop()
    // formats: videoFormat[];

    // @Prop()
    // related_videos: relatedVideo[];

    // @Prop()
    // no_embed_allowed?: boolean;

    // @Prop({ type: Object })
    // player_response: {
    //     playabilityStatus: {
    //         status: string;
    //         playableInEmbed: boolean;
    //         miniplayer: {
    //             miniplayerRenderer: {
    //                 playbackMode: string;
    //             };
    //         };
    //         contextParams: string;
    //     };
    //     streamingData: {
    //         expiresInSeconds: string;
    //         formats: {}[];
    //         adaptiveFormats: {}[];
    //     };
    //     captions?: {
    //         playerCaptionsRenderer: {
    //             baseUrl: string;
    //             visibility: string;
    //         };
    //         playerCaptionsTracklistRenderer: {
    //             captionTracks: captionTrack[];
    //             audioTracks: audioTrack[];
    //             translationLanguages: translationLanguage[];
    //             defaultAudioTrackIndex: number;
    //         };
    //     };
    //     microformat: {
    //         playerMicroformatRenderer: MicroformatRenderer;
    //     };
    //     videoDetails: VideoDetails;
    //     playerConfig: {
    //         audioConfig: {
    //             loudnessDb: number;
    //             perceptualLoudnessDb: number;
    //             enablePerFormatLoudness: boolean;
    //         };
    //         streamSelectionConfig: { maxBitrate: string };
    //         mediaCommonConfig: { dynamicReadaheadConfig: {}[] };
    //         webPlayerConfig: { webPlayerActionsPorting: {}[] };
    //     };
    // };

    // @Prop({ type: Object })
    // videoDetails: MoreVideoDetails;
}

export const InfoSchema = SchemaFactory.createForClass(Info);
