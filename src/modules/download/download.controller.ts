import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import { DownloadService } from './download.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';

@Controller('download')
export class DownloadController {
    constructor(private readonly downloadService: DownloadService) {}

    @Post()
    create(@Body() createDownloadDto: CreateDownloadDto) {
        return this.downloadService.create(createDownloadDto);
    }

    @Get('video')
    findAll() {
        return this.downloadService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.downloadService.findOne(+id);
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
