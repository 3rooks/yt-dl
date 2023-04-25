import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import { DownloadLocalVideoDto } from './dto/download-local-video';
import { UpdateLocalDto } from './dto/update-local.dto';
import { LocalService } from './local.service';

@Controller('local')
export class LocalController {
    constructor(private readonly localService: LocalService) {}

    @Post('video')
    create(@Body() createLocalDto: DownloadLocalVideoDto) {
        return this.localService.create(createLocalDto);
    }

    @Get()
    findAll() {
        return this.localService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.localService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateLocalDto: UpdateLocalDto) {
        return this.localService.update(+id, updateLocalDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.localService.remove(+id);
    }
}
