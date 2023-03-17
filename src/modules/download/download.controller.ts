import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Res
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { spawn } from 'child_process';
import { Response } from 'express';
// import ffmpeg from 'ffmpeg-static';
import {path} from '@ffmpeg-installer/ffmpeg'
import { Writable } from 'stream';
import { downloadFromInfo, getInfo, validateURL } from 'ytdl-core';
import { InfoService } from '../info/info.service';
import { DownloadService } from './download.service';
import { DownloadVideoDto } from './dto/download-video.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly downloadService: DownloadService,
        private readonly infoService: InfoService
    ) {}

    @Post('video')
    async download(@Body() { url }: DownloadVideoDto, @Res() res: Response) {
        console.log("ASDASDASD", path)
        const validUrl = validateURL(url);
        if (!validUrl) throw new BadRequestException('INVALID_YOUTUBE_URL');


        const info = await getInfo(url);

        const video = downloadFromInfo(info, { filter: 'videoonly' });
        const audio = downloadFromInfo(info, { filter: 'audioonly' });

        // const video = ytdl(url, { filter: 'videoonly' })
        // const audio = ytdl(url, { filter: 'audioonly' });
        // Start the ffmpeg child process
        const ffmpegProcess = spawn(
            path,
            [
                '-loglevel',
                '8',
                '-hide_banner',
                '-i',
                'pipe:3',
                '-i',
                'pipe:4',
                '-map',
                '0:a',
                '-map',
                '1:v',
                '-c:v',
                'copy',
                'out.mp4'
            ],
            {
                windowsHide: true,
                stdio: [
                    /* Standard: stdin, stdout, stderr */
                    'inherit',
                    'inherit',
                    'inherit',
                    /* Custom: pipe:3, pipe:4 */
                    'pipe',
                    'pipe'
                ]
            }
        );

        audio.pipe(ffmpegProcess.stdio[3] as Writable);
        video.pipe(ffmpegProcess.stdio[4] as Writable);

        // const results = await this.downloadService.create({
        //     ...data,
        //     info: (await this.infoService.create(data.info))._id
        // });

        // return res.sendFile(results.file);
        // return new StreamableFile(createReadStream(results.file));
        return res.send('ASDASDASD');
    }

    @Get('video')
    async findAllDoc() {
        return await this.downloadService.findAll();
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateDownloadDto: UpdateDownloadDto
    ) {
        return this.downloadService.update(+id, updateDownloadDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.downloadService.remove(+id);
    }
}
