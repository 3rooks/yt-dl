import {
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
import { Response } from 'express';
import { ffmpegDownloader } from 'src/lib/ffmpeg-download';
import { ytdlDownloader } from 'src/lib/ytdl-downloader';
import * as ytdl from 'ytdl-core';
import { InfoService } from '../info/info.service';
import { DownloadService } from './download.service';
import { DownloadVideoDto } from './dto/download-video.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';
import { DownloadDocument } from './schema/download.schema';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly downloadService: DownloadService,
        private readonly infoService: InfoService
    ) {}

    @Post('video')
    async download(@Body() { url }: DownloadVideoDto, @Res() res: Response) {
        try {
            const id = ytdl.getVideoID(url);

            const exist = await this.downloadService.findOneByVideoId(id);
            if (exist) return res.redirect(`video/${exist.id}`);

            const info = await ytdl.getInfo(url);
            const paths = await ytdlDownloader(info);
            ffmpegDownloader(paths);

            const { _id } = await this.infoService.createInfo(info);
            await this.downloadService.create({
                id,
                details: info.videoDetails,
                info: _id,
                file: paths.outputFile
            });

            return res.redirect(`video/${id}`);
        } catch (error) {
            console.log('RRRRRR', error.message, error.stack);
        }
    }

    @Get('video/:id')
    async findVideoById(@Param('id') id: string): Promise<DownloadDocument> {
        return await this.downloadService.findOneByVideoId(id);
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
