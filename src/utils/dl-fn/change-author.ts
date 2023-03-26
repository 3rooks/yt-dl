import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { Exception } from '../error/exception-handler';
import { outputTextImagePath } from '../ytdl-paths';

export const changeAuthor = async (
    exist: Download,
    channelInfo: IChannelInfo,
    downloadService: DownloadService
) => {
    try {
        const { outputText, outputImage } = await outputTextImagePath(
            channelInfo
        );
        const imgUrl = channelInfo.thumbnails.high.url;
        if (!exist) {
            await downloadService.downloadTextAndImage(
                imgUrl,
                outputImage,
                channelInfo,
                outputText
            );

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
                await downloadService.downloadTextAndImage(
                    imgUrl,
                    outputImage,
                    channelInfo,
                    outputText
                );

                exist = await downloadService.updateById(exist._id, {
                    channelInfo
                });
            }
        }
        return exist;
    } catch (error) {
        throw Exception.catch(error.message);
    }
};
