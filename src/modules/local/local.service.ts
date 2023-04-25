import { Injectable } from '@nestjs/common';
import { CreateLocalDto } from './dto/download-local-video';
import { UpdateLocalDto } from './dto/update-local.dto';

@Injectable()
export class LocalService {
    create(createLocalDto: CreateLocalDto) {
        return 'This action adds a new local';
    }

    findAll() {
        return `This action returns all local`;
    }

    findOne(id: number) {
        return `This action returns a #${id} local`;
    }

    update(id: number, updateLocalDto: UpdateLocalDto) {
        return `This action updates a #${id} local`;
    }

    remove(id: number) {
        return `This action removes a #${id} local`;
    }
}
