import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Info } from '../info/schema/info.schema';
import { Search, SearchDocument } from './schema/search.schema';

@Injectable()
export class SearchService {
    constructor(
        @InjectModel(Search.name)
        private readonly searchModel: Model<SearchDocument>
    ) {}

    async create(data: Search): Promise<SearchDocument> {
        return await new this.searchModel(data).save();
    }

    async findAll() {
        return await this.searchModel.find().exec();
    }

    async findByVideoId(id: string) {
        return await this.searchModel
            .findOne({ id })
            .populate<{ info: Info }>('info', { formats: 1, videoDetails: 1 })
            .exec();
    }

    async remove(id: number) {
        return await this.searchModel.findByIdAndDelete(id);
    }
}
