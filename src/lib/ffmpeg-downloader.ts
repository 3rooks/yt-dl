import { path } from '@ffmpeg-installer/ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';

/**
 * SPAWN
 * on('end')
 * on('error', error)
 * on('start', comand)
 * on('progress', progress)
 */

ffmpeg.setFfmpegPath(path);

export const ffmpegVideo = ffmpeg();
export const ffmpegImageDownloader = ffmpeg();
