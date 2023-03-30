import { existsSync } from 'fs';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { DownloadService } from 'src/modules/download/download.service';
import { outputTextImagePath } from '../ytdl-paths';

export const watcherKeys = async (
    keys: string[],
    outputFolder: string,
    googleService: GoogleapiService,
    downloadService: DownloadService
) => {
    const videoIds = await downloadService.funciona(keys);

    const videoInfos = await Promise.all(
        videoIds.map((videoId) => googleService.getVideoInfoByTime(videoId))
    );
    const validVideoInfos = videoInfos.filter((info) => info !== undefined);

    const channelInfos = await Promise.all(
        validVideoInfos.map((info) =>
            googleService.getChannelInfo(info.channelId)
        )
    );
    await Promise.all(
        channelInfos.map(async (channelInfo) => {
            const { outputText, outputImage } = await outputTextImagePath(
                channelInfo,
                outputFolder
            );

            const sanitizedOutputImage = outputImage.replace(/=[0-9]+/, '');
            const sanitizedOutputText = outputText.replace(/=[0-9]+/, '');

            if (
                !existsSync(sanitizedOutputImage) &&
                !existsSync(sanitizedOutputText)
            ) {
                await downloadService.downloadTextAndImage(
                    channelInfo.thumbnails.high.url,
                    sanitizedOutputImage,
                    channelInfo,
                    sanitizedOutputText
                );
            }
        })
    );

    const res = await downloadService.downloadVideos(
        validVideoInfos,
        outputFolder
    );
    console.log('RESULTS', res.length);
};
