import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { filterFormats, getInfo, getVideoID, validateURL } from 'ytdl-core';
import { InfoService } from '../info/info.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(
        private readonly searchService: SearchService,
        private readonly infoService: InfoService
    ) {}

    @Post()
    async create(@Body() { url }: CreateSearchDto) {
        const isValid = validateURL(url);
        if (!isValid) throw new BadRequestException('INVALID_YOUTUBE_URL');

        const id = getVideoID(url);

        const exist = await this.searchService.findByVideoId(id);
        console.log(exist);
        if (exist) return filterFormats(exist.info.formats, 'audioandvideo');

        const info = await getInfo(url);

        const { _id } = await this.infoService.create(info);
        await this.searchService.create({
            id,
            info: _id
        });

        return filterFormats(info.formats, 'audioandvideo');
    }

    @Get()
    async findAll() {
        return await this.infoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.searchService.findByVideoId(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSearchDto: UpdateSearchDto) {
        return;
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.searchService.remove(+id);
    }
}
