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
        if (exist) {
            const res = await this.infoService.findById(exist.info);
            const formats = filterFormats(res.formats, 'videoandaudio');
            return formats;
        }

        const info = await getInfo(url);

        const { _id } = await this.infoService.create(info);

        const results = await this.searchService.create({
            vidId: id,
            info: _id
        });

        return results;
    }

    @Get()
    async findAll() {
        return await this.infoService.findAll();
        // return this.searchService.findAll();
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
