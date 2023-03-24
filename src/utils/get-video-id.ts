/*
https://www.youtube.com/watch?v=dQw4w9WgXcQ: dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ: dQw4w9WgXcQ
https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be: dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ: dQw4w9WgXcQ
https://www.youtube.com/v/dQw4w9WgXcQ: dQw4w9WgXcQ
*/

const validYoutubeDomain =
    /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;

export const isValidYoutubeUrl = (url: string): boolean => {
    return validYoutubeDomain.test(url);
};

const getVideoIdRegEx =
    /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)([a-zA-Z0-9_-]{11})/;

export const getVideoId = (url: string) => {
    const match = url.match(getVideoIdRegEx);
    return match ? match[4] : undefined;
};

const validVideoId = /^[a-zA-Z0-9-_]{11}$/;

export const isValidVideoId = (videoId: string) => {
    return validVideoId.test(videoId);
};
