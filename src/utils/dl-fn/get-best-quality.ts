import { chooseFormat, videoFormat } from 'ytdl-core';

export const getBestAudioFormat = (formats: videoFormat[]) => {
    let bestAudioFormat: videoFormat;

    try {
        bestAudioFormat = chooseFormat(formats, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        const { audioQuality, itag } = bestAudioFormat;
        console.log(`highestaudio => ${audioQuality} - ${itag}`);
    } catch (error) {
        try {
            bestAudioFormat = chooseFormat(formats, {
                filter: 'audioonly',
                quality: 'highest'
            });

            const { audioQuality, itag } = bestAudioFormat;
            console.log(`highest => ${audioQuality} - ${itag}`);
        } catch (error) {
            try {
                bestAudioFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowest'
                });

                const { audioQuality, itag } = bestAudioFormat;
                console.log(`lowest => ${audioQuality} - ${itag}`);
            } catch (error) {
                bestAudioFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowestaudio'
                });

                const { audioQuality, itag } = bestAudioFormat;
                console.log(`lowestaudio => ${audioQuality} - ${itag}`);
            }
        }
    }

    return bestAudioFormat;
};

export const getBestVideoFormat = (formats: videoFormat[]) => {
    let bestVideoFormat: videoFormat;

    try {
        bestVideoFormat = chooseFormat(formats, {
            filter: 'videoonly',
            quality: 'highestvideo'
        });

        const { width, height, itag } = bestVideoFormat;
        console.log(`highestvideo => ${width}x${height} - ${itag}`);
    } catch (error) {
        try {
            bestVideoFormat = chooseFormat(formats, {
                filter: 'videoonly',
                quality: 'highest'
            });

            const { width, height, itag } = bestVideoFormat;
            console.log(`highest => ${width}x${height} - ${itag}`);
        } catch (error) {
            try {
                bestVideoFormat = chooseFormat(formats, {
                    filter: 'videoonly',
                    quality: 'lowest'
                });

                const { width, height, itag } = bestVideoFormat;
                console.log(`lowest => ${width}x${height} - ${itag}`);
            } catch (error) {
                bestVideoFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowestvideo'
                });

                const { width, height, itag } = bestVideoFormat;
                console.log(`lowestvideo => ${width}x${height} - ${itag}`);
            }
        }
    }

    return bestVideoFormat;
};
