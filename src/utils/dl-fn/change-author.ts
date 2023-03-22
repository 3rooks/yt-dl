import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { MoreVideoDetails } from 'ytdl-core';
import { outputPaths } from '../ytdl-paths';

export const changeAuthor = async (
    exist: Download,
    videoDetails: MoreVideoDetails,
    downloadService: DownloadService
): Promise<Download> => {
    if (exist) {
        const { authorInfo } = exist;
        const { id, name, thumbnails } = authorInfo;

        if (
            id !== videoDetails.author.id ||
            name !== videoDetails.author.name ||
            thumbnails[0].url !== videoDetails.author.thumbnails[0].url
        ) {
            exist = await downloadService.updateById(exist._id, {
                authorInfo: videoDetails.author
            });
            await downloadImageAndText(downloadService, videoDetails);
        }
    } else {
        exist = await downloadService.create({
            authorInfo: videoDetails.author,
            channelId: videoDetails.channelId
        });
        await downloadImageAndText(downloadService, videoDetails);
    }
    return exist;
};

const downloadImageAndText = async (
    downloadService: DownloadService,
    videoDetails: MoreVideoDetails
): Promise<void> => {
    const { outputText, outputImage } = await outputPaths(videoDetails);

    await downloadService.downloadImage(
        videoDetails.author.thumbnails[
            videoDetails.author.thumbnails.length - 1
        ].url,
        outputImage
    );
    await downloadService.saveInfoTxt(videoDetails, outputText);
};
