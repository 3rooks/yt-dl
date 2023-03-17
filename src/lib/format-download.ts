// import {
//     chooseFormat,
//     Filter,
//     filterFormats,
//     videoFormat,
//     videoInfo
// } from 'ytdl-core';

// export const filterFormat = (info: videoInfo): videoFormat => {
//     const itag = highestItag(info.formats, 'videoandaudio');
//     return selectFormat(info.formats, itag);
// };

// const highestItag = (
//     formats: videoFormat | videoFormat[],
//     filterBy: Filter
// ): number => {
//     const videoFormats = filterFormats(formats, filterBy);
//     const videoItags = videoFormats.map((format) => format.itag);
//     return Math.max(...videoItags);
// };

// const selectFormat = (
//     formats: videoFormat | videoFormat[],
//     itag: number
// ): videoFormat => {
//     return chooseFormat(formats, {
//         quality: itag
//     });
// };
