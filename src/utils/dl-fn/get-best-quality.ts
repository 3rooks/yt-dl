import { chooseFormat, videoFormat } from 'ytdl-core';

export const getBestAudioFormat = (formats: videoFormat[]): videoFormat => {
    return formats.reduce((best: videoFormat, current: videoFormat) => {
        if (
            current.audioBitrate &&
            current.audioCodec &&
            current.audioBitrate > best.audioBitrate
        ) {
            return current;
        }
        return best;
    }, formats[0]);
};

export const getBestVideoFormat = (formats: videoFormat[]): videoFormat => {
    return formats.reduce((best: videoFormat, current: videoFormat) => {
        if (current.hasVideo && current.qualityLabel && current.itag !== 43) {
            const bestQuality = best.qualityLabel
                ? parseInt(best.qualityLabel.split('p')[0])
                : 0;
            const currentQuality = parseInt(current.qualityLabel.split('p')[0]);
            if (currentQuality > bestQuality) {
                return current;
            }
        }
        return best;
    }, formats[0]);
};

export const getBestAudioFormats = (formats: videoFormat[]) => {
    let bestAudioFormat: videoFormat;

    bestAudioFormat = chooseFormat(formats, {
        filter: 'audioonly',
        quality: 'highestaudio'
    });
    if (!bestAudioFormat) {
        bestAudioFormat = chooseFormat(formats, {
            filter: 'audioonly',
            quality: 'highest'
        });
    }
    if (!bestAudioFormat) {
        bestAudioFormat = chooseFormat(formats, {
            filter: 'audioonly',
            quality: 'lowestaudio'
        });
    }
    if (!bestAudioFormat) {
        bestAudioFormat = chooseFormat(formats, {
            filter: 'audioonly',
            quality: 'lowest'
        });
    }
    return bestAudioFormat;
};

export const getBestVideoFormats = (formats: videoFormat[]) => {
    let bestVideoFormat: videoFormat;

    bestVideoFormat = chooseFormat(formats, {
        filter: 'videoonly',
        quality: 'highestvideo'
    });
    if (!bestVideoFormat) {
        bestVideoFormat = chooseFormat(formats, {
            filter: 'videoonly',
            quality: 'highest'
        });
    }
    if (!bestVideoFormat) {
        bestVideoFormat = chooseFormat(formats, {
            filter: 'audioonly',
            quality: 'lowestvideo'
        });
    }
    if (!bestVideoFormat) {
        bestVideoFormat = chooseFormat(formats, {
            filter: 'videoonly',
            quality: 'lowest'
        });
    }
    return bestVideoFormat;
};
