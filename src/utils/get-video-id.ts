import { Exception } from './error/exception-handler';

export const validateAndExtractVideoId = (videoUrl: string): string => {
    if (!isValidYoutubeUrl(videoUrl))
        throw new Exception({
            message: 'INVALID_YOUTUBE_URL',
            status: 'BAD_REQUEST'
        });

    if (!validateYoutubeVideoLink(videoUrl))
        throw new Exception({
            message: 'INVALID_YOUTUBE_VIDEO_URL',
            status: 'BAD_REQUEST'
        });

    const videoId = getVideoId(videoUrl);

    if (!videoId)
        throw new Exception({
            message: 'CAN_NOT_GET_VIDEO_ID',
            status: 'BAD_REQUEST'
        });

    if (!isValidVideoId(videoId))
        throw new Exception({
            message: 'INVALID_YOUTUBE_VIDEO_ID',
            status: 'BAD_REQUEST'
        });

    return videoId;
};

/*
https://www.youtube.com/watch?v=dQw4w9WgXcQ: dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ: dQw4w9WgXcQ
https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be: dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ: dQw4w9WgXcQ
https://www.youtube.com/v/dQw4w9WgXcQ: dQw4w9WgXcQ
https://www.youtube.com/shorts/dQw4w9WgXcQ: dQw4w9WgXcQ
*/

export const isValidYoutubeUrl = (url: string): boolean => {
    const regex =
        /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts|channel|@|watch\?v=))/;
    return regex.test(url);
};

export const getVideoId = (url: string): string | null => {
    const regex =
        /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/))([\w-]{11})(?:\S+)?$/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const validateYoutubeVideoLink = (videoUrl: string): boolean => {
    const regex =
        /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/))([\w-]{11})(?:\S+)?$/;
    return regex.test(videoUrl);
};

export const isValidVideoId = (videoId: string): boolean => {
    const regex = /^[a-zA-Z0-9-_]{11}$/;
    return regex.test(videoId);
};
