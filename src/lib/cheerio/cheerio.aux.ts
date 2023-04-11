import { load } from 'cheerio';
import miniget from 'miniget';

export const getChannelIdVideoId = async (url: string) => {
    const html = await miniget(url).text();
    const $ = load(html);

    const channelId = $('meta[itemprop="channelId"]').attr('content');
    const videoId = $('meta[itemprop="videoId"]').attr('content');

    return { channelId, videoId };
};
