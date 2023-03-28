import { Inject, Injectable } from '@nestjs/common';
import { Exception } from 'src/utils/error/exception-handler';
import * as ytsrCore from 'ytsr';

@Injectable()
export class YtsrService {
    constructor(@Inject('YTSR') private readonly ytsr: typeof ytsrCore) {}

    async getLastHourUrls(searches: string[]): Promise<string[]> {
        try {
            const filtersUrls = searches.map(async (search) => {
                const filter = await this.ytsr.getFilters(search);
                const url = filter.get('Upload date').get('Last hour').url;
                return url;
            });
            return Promise.all([...filtersUrls]);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }

    async getVideoIdsFromUrl(url: string): Promise<string[]> {
        try {
            const { items } = await this.ytsr(url, { pages: 1 });
            const videos = items as ytsrCore.Video[];

            if (!items.length) return;

            return videos.map((video) => video.id);
        } catch (error) {
            throw Exception.catch(error.message);
        }
    }
}
