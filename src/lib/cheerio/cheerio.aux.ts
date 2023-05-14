import { load } from 'cheerio';
import miniget from 'miniget';

export const getChannelIdVideoId = async (url: string) => {
    const html = await miniget(url).text();
    const $ = load(html);

    const channelId = $('link[rel="canonical"]').attr('href').split('/').pop();

    return { channelId };
};
