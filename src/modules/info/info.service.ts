import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Info, InfoDocument } from './schema/info.schema';

@Injectable()
export class InfoService {
    constructor(
        @InjectModel(Info.name) private readonly InfoModel: Model<InfoDocument>
    ) {}

    async create(info: object): Promise<InfoDocument> {
        return await new this.InfoModel(info).save();
    }

    async findAll(): Promise<InfoDocument[]> {
        return await this.InfoModel.find().exec();
    }

    async findById(id: string): Promise<InfoDocument> {
        return await this.InfoModel.findById(id).exec();
    }

    async remove(id: string): Promise<InfoDocument> {
        return await this.InfoModel.findByIdAndDelete(id).exec();
    }
}
