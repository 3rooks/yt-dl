import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { Exception } from '../error/exception-handler';
import { outputPaths } from '../ytdl-paths';

export const changeAuthor = async (
    exist: Download,
    videoInfo: IVideoInfo,
    channelInfo: IChannelInfo,
    downloadService: DownloadService
) => {
    try {
        if (!exist) {
            await downloadImageAndText(videoInfo, channelInfo, downloadService);
            exist = await downloadService.create({
                id: channelInfo.channelId,
                channelInfo,
                downloads: []
            });
        } else {
            if (
                JSON.stringify(channelInfo) !==
                JSON.stringify(exist.channelInfo)
            ) {
                await downloadImageAndText(
                    videoInfo,
                    channelInfo,
                    downloadService
                );
                exist = await downloadService.updateById(exist._id, {
                    channelInfo
                });
            }
        }
        return exist;
    } catch (error) {
        throw Exception.create(error.message);
    }
};

export const downloadImageAndText = async (
    videoInfo: IVideoInfo,
    channelInfo: IChannelInfo,
    downloadService: DownloadService
): Promise<void> => {
    try {
        const { outputText, outputImage } = await outputPaths(videoInfo);

        await downloadService.downloadImage(
            channelInfo.thumbnails.high.url,
            outputImage
        );
        await downloadService.saveInfoTxt(channelInfo, outputText);
    } catch (error) {
        throw Exception.create(error.message);
    }
};
