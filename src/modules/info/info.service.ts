import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MoreVideoDetails } from 'ytdl-core';
import { Info, InfoDocument } from './schema/info.schema';

@Injectable()
export class InfoService {
    constructor(
        @InjectModel(Info.name) private readonly infoModel: Model<InfoDocument>
    ) {}

    async createInfo(info: MoreVideoDetails): Promise<Info> {
        return await new this.infoModel(info).save();
    }

    async getById(id: string): Promise<Info> {
        return await this.infoModel.findById(id).exec();
    }

    async getAll(): Promise<Info[]> {
        return await this.infoModel.find().exec();
    }

    async updateById(id: string, data: object) {
        return await this.infoModel.findByIdAndUpdate(id, data).exec();
    }

    async remove(id: string): Promise<Info> {
        return await this.infoModel.findByIdAndDelete(id).exec();
    }
}
