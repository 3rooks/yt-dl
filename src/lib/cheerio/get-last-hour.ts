import { load } from 'cheerio';
import * as miniget from 'miniget';

export async function getVideoIdsFromUrl(url: string) {
    const response = await miniget(url).text();
    const $ = load(response);
    const videoIds = [];
    $('a#thumbnail').each(function () {
        const href = $(this).attr('href');
        if (href.startsWith('/watch')) {
            videoIds.push(href.slice(9));
        }
    });

    console.log(videoIds);
    return videoIds;
}
