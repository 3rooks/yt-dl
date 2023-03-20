import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as ytdl from 'ytdl-core';
import { InfoService } from '../info/info.service';
import { DownloadService } from './download.service';
import { DownloadVideoDto } from './dto/download-video.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly dlService: DownloadService,
        private readonly infoService: InfoService
    ) {}

    @Post('video')
    async download(@Body() { url }: DownloadVideoDto, @Res() res: Response) {
        try {
            const info = await ytdl.getInfo(url);

            const a = await this.infoService.createInfo(info.videoDetails);

            const b = await this.dlService.create({
                authorInfo: info.videoDetails.author,
                channelId: 'w'
            });

            // const paths = await ytdlDownloader(info);
            // ffmpegMergeAudioVideo(paths);

            // ffmpegVideo.on('end', async () => {
            //     try {
            //         const file = paths.outputFile.split('\\').pop();
            //         console.log(`FINISHED => ${file}`);
            //         await unlink(paths.outputAudio);
            //         await unlink(paths.outputVideo);
            //         return res.json({});
            //     } catch (error) {
            //         throw new Error(`ERROR_UNLINK_FILES`);
            //     }
            // });

            return res.send('asdasdasd');
        } catch (error) {
            throw new Error(`[POST]Video: ${error.message} - ${error.stack}`);
        }
    }
}
