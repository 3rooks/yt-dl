import { Inject, Injectable } from '@nestjs/common';
import * as ytsrCore from 'ytsr';

@Injectable()
export class YtsrService {
    constructor(@Inject('YTSR') private readonly ytsr: typeof ytsrCore) {}

    async getLastHourUrl(search: string): Promise<string> {
        const filter = await this.ytsr.getFilters(search, {});
        const url = filter.get('Upload date').get('Last hour').url;
        return url;
    }

    async getVideosFiltered(url: string) {
        const { items } = await this.ytsr(url, { pages: 1 });
        return items as ytsrCore.Video[];
    }
}
