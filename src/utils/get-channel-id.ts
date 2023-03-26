import { google } from 'googleapis';
import { Exception } from './error/exception-handler';

const channelRegEx = /youtube.com\/channel\/([\w-]+)/;

export const extractChannelIdFromChannelUrl = (url: string): string | null => {
    const channelIdMatch = url.match(channelRegEx);
    if (channelIdMatch) {
        return channelIdMatch[1];
    }
    return null;
};

const userRegEx = /youtube.com\/@([\w-]+)/;

export const extractChannelIdFromUsername = async (
    url: string,
    youtube: typeof google
): Promise<string | null> => {
    try {
        const usernameMatch = url.match(userRegEx);
        if (usernameMatch) {
            const response = await youtube.search.list({
                part: 'snippet',
                type: 'channel',
                q: usernameMatch[1]
            });

            return response.data.items[0].snippet.channelId;
        }
        return null;
    } catch (error) {
        throw Exception.catch(error.message);
    }
};
