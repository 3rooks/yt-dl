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
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import { pipeline } from 'stream/promises';
import ytdl, {
    chooseFormat,
    downloadFromInfo,
    filterFormats,
    getInfo
} from 'ytdl-core';
import { DownloadService } from './download.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { DownloadVideoDto } from './dto/download-video.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(private readonly downloadService: DownloadService) {}

    @Post()
    async create(@Body() body: CreateDownloadDto): Promise<ytdl.videoFormat[]> {
        const { formats } = await getInfo(body.url);
        return filterFormats(formats, 'videoandaudio');
    }

    @Post('video')
    async down(
        @Body() body: DownloadVideoDto,
        @Res() res: Response
    ): Promise<void> {
        try {
            const info = await getInfo(body.url);

            const exist = await this.downloadService.findOneByVideoId(
                info.videoDetails.videoId
            );

            if (exist) return res.sendFile(exist.file);

            const format = chooseFormat(info.formats, { quality: body.itag });

            await mkdir(`${OUTPUT_PATH}/${info.videoDetails.author.name}`, {
                recursive: true
            });

            const file = downloadFromInfo(info);
            const ws = createWriteStream(
                `${OUTPUT_PATH}/${info.videoDetails.author.name}/${info.videoDetails.title}-${info.videoDetails.videoId}.${format.container}`
            );

            await pipeline([file, ws]);

            const results = await this.downloadService.saveDownload({
                ...info.videoDetails,
                file: `${OUTPUT_PATH}/${info.videoDetails.author.name}/${info.videoDetails.title}-${info.videoDetails.videoId}.${format.container}`
            });

            return res.sendFile(results.file, (err) => {
                if (err) console.log(err);
            });
        } catch (error) {
            console.log('ERROR', error);
        }
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
