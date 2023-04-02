import { chooseFormat, videoFormat } from 'ytdl-core';

export const getBestAudioFormat = (formats: videoFormat[]) => {
    let bestAudioFormat: videoFormat;

    try {
        bestAudioFormat = chooseFormat(formats, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });
        console.log(`highestaudio => ${bestAudioFormat.itag}`);
    } catch (error) {
        try {
            bestAudioFormat = chooseFormat(formats, {
                filter: 'audioonly',
                quality: 'highest'
            });
            console.log(`highest =>  ${bestAudioFormat.itag}`);
        } catch (error) {
            try {
                bestAudioFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowest'
                });
                console.log(`lowest => ${bestAudioFormat.itag}`);
            } catch (error) {
                bestAudioFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowestaudio'
                });
                console.log(`lowestaudio => ${bestAudioFormat.itag}`);
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
        console.log(`highestvideo => ${itag} (${width}x${height})`);
    } catch (error) {
        try {
            bestVideoFormat = chooseFormat(formats, {
                filter: 'videoonly',
                quality: 'highest'
            });

            const { width, height, itag } = bestVideoFormat;
            console.log(`highest => ${itag} (${width}x${height})`);
        } catch (error) {
            try {
                bestVideoFormat = chooseFormat(formats, {
                    filter: 'videoonly',
                    quality: 'lowest'
                });

                const { width, height, itag } = bestVideoFormat;
                console.log(`lowest => ${itag} (${width}x${height})`);
            } catch (error) {
                bestVideoFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowestvideo'
                });

                const { width, height, itag } = bestVideoFormat;
                console.log(`lowestvideo => ${itag} (${width}x${height})`);
            }
        }
    }

    return bestVideoFormat;
};
