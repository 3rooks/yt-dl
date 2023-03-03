import { Injectable } from '@nestjs/common';
import { CreateDownloadDto } from './dto/create-download.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';

@Injectable()
export class DownloadService {
    create(createDownloadDto: CreateDownloadDto) {
        return 'This action adds a new download';
    }

    findAll() {
        return `This action returns all download`;
    }

    findOne(id: number) {
        return `This action returns a #${id} download`;
    }

    update(id: number, updateDownloadDto: UpdateDownloadDto) {
        return `This action updates a #${id} download`;
    }

    remove(id: number) {
        return `This action removes a #${id} download`;
    }
}
