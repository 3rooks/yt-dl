/*
https://www.youtube.com/watch?v=dQw4w9WgXcQ: dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ: dQw4w9WgXcQ
https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be: dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ: dQw4w9WgXcQ
https://www.youtube.com/v/dQw4w9WgXcQ: dQw4w9WgXcQ
*/

import { Exception } from './error/exception-handler';

const validYoutubeDomain =
    /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;

export const isValidYoutubeUrl = (url: string): boolean => {
    return validYoutubeDomain.test(url);
};

const getVideoIdRegEx =
    /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)([a-zA-Z0-9_-]{11})/;

export const getVideoId = (url: string): string => {
    const match = url.match(getVideoIdRegEx);
    return match[4];
};

const validVideoId = /^[a-zA-Z0-9-_]{11}$/;

export const isValidVideoId = (videoId: string) => {
    return validVideoId.test(videoId);
};

export const getVideoIdValidated = (videoUrl: string): string => {
    if (!isValidYoutubeUrl(videoUrl))
        throw new Exception({
            status: 'BAD_REQUEST',
            message: 'INVALID_YOUTUBE_URL'
        });

    const videoId = getVideoId(videoUrl);

    if (!isValidVideoId(videoId))
        throw new Exception({
            status: 'BAD_REQUEST',
            message: 'INVALID_VIDEO_ID'
        });

    return videoId;
};
