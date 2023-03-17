import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateDownloadDto } from './dto/update-download.dto';
import { Download, DownloadDocument } from './schema/download.schema';

@Injectable()
export class DownloadService {
    constructor(
        @InjectModel(Download.name)
        private readonly downloadModel: Model<DownloadDocument>
    ) {}

    async create(data: Download): Promise<DownloadDocument> {
        return new this.downloadModel(data).save();
    }

    async findAll(): Promise<Download[]> {
        return this.downloadModel.find().exec();
    }

    findOneByVideoId(id: string): Promise<Download> {
        return this.downloadModel.findOne({ videoId: id }).exec();
    }

    update(id: number, updateDownloadDto: UpdateDownloadDto) {
        return `This action updates a #${id} download`;
    }

    remove(id: number) {
        return `This action removes a #${id} download`;
    }
}
