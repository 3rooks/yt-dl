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
