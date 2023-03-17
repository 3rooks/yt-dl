// Buildin with nodejs
import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { Writable } from 'stream';
import { downloadFromInfo, getInfo } from 'ytdl-core';

export const Down = async ()=>{
    try {
        
    const url = 'https://youtube.com/shorts/CrzpsSJuNE4?feature=share';

    const info = await getInfo(url);

    const video = downloadFromInfo(info, {filter:"videoonly"})
    const audio = downloadFromInfo(info, {filter: 'audioonly'})
    
    // const video = ytdl(url, { filter: 'videoonly' })
    // const audio = ytdl(url, { filter: 'audioonly' });
    // Start the ffmpeg child process
    const ffmpegProcess = spawn(
        ffmpeg,
        [
            // Remove ffmpeg's console spamming
        '-loglevel',  '8', '-hide_banner',
        // Set inputs
         '-i', 'pipe:3',
         '-i', 'pipe:4',
         // Map audio & video from streams
         '-map', '0:a',
         '-map', '1:v',
         // Keep encoding
         '-c:v', 'copy',
         // Define output container
         'out.mp4'
        ],
        {
            windowsHide: true,
        stdio:  [
            /* Standard: stdin, stdout, stderr */
            'inherit', 'inherit', 'inherit',
            /* Custom: pipe:3, pipe:4 */
            'pipe', 'pipe'
        ],
    }
    );
    
    audio.pipe(ffmpegProcess.stdio[3] as Writable);
    video.pipe(ffmpegProcess.stdio[4] as Writable);
} catch (error) {
            console.log('ERRORROR', error.stack)
}
    
}