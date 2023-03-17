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
import { Down } from 'src/lib/download';
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
        try {
            Down(url);
            return res.send('ASD');
        } catch (error) {
            console.log('RRRRRR', error.message, error.stack);
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
