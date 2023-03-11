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
import { DownloadService } from './download.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';

import { Response } from 'express';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { OUTPUT_PATH } from 'src/utils/paths.resource';
import ytdl, {
    chooseFormat,
    downloadFromInfo,
    filterFormats,
    getInfo
} from 'ytdl-core';
import { DownloadVideoDto } from './dto/download-video.dto';

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
        const info = await getInfo(body.url);
        const format = chooseFormat(info.formats, { quality: body.itag });

        await mkdir(`${OUTPUT_PATH}/${info.videoDetails.author.name}`, {
            recursive: true
        });

        const file = downloadFromInfo(info, { format });

        file.pipe(
            createWriteStream(
                `${OUTPUT_PATH}/${info.videoDetails.author.name}/${info.videoDetails.title}-${info.videoDetails.videoId}.${format.container}`
            )
        );

        const results = await this.downloadService.saveDownload({
            ...info.videoDetails,
            file: `${OUTPUT_PATH}/${info.videoDetails.author.name}/${info.videoDetails.title}-${info.videoDetails.videoId}.${format.container}`
        });

        file.on('end', () => {
            return res.sendFile(results.file, (err) => {
                if (err) console.log(err);
            });
        });
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
