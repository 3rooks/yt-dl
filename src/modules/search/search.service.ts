import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

    async findByVideoId(id: string): Promise<SearchDocument> {
        const results = await this.searchModel.findOne({ id });
        // if (results) return await results.populate('info');
        return results;
    }

    async remove(id: number) {
        return await this.searchModel.findByIdAndDelete(id);
    }
}
