import { chooseFormat, videoFormat } from 'ytdl-core';

export const getBestAudioFormat = (formats: videoFormat[]) => {
    let bestAudioFormat: videoFormat;

    try {
        bestAudioFormat = chooseFormat(formats, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        const { audioBitrate, audioCodec, itag } = bestAudioFormat;
        console.log(`highestaudio => ${audioBitrate}x${audioCodec} - ${itag}`);
    } catch (error) {
        try {
            bestAudioFormat = chooseFormat(formats, {
                filter: 'audioonly',
                quality: 'highest'
            });

            const { audioBitrate, audioCodec, itag } = bestAudioFormat;
            console.log(`highest => ${audioBitrate}x${audioCodec} - ${itag}`);
        } catch (error) {
            try {
                bestAudioFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowest'
                });

                const { audioBitrate, audioCodec, itag } = bestAudioFormat;
                console.log(
                    `lowest => ${audioBitrate}x${audioCodec} - ${itag}`
                );
            } catch (error) {
                bestAudioFormat = chooseFormat(formats, {
                    filter: 'audioonly',
                    quality: 'lowestaudio'
                });

                const { audioBitrate, audioCodec, itag } = bestAudioFormat;
                console.log(
                    `lowestaudio => ${audioBitrate}x${audioCodec} - ${itag}`
                );
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
