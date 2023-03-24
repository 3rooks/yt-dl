import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/video-info.interface';
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
        if (exist) {
            console.log("EXIST_INOT", exist)
            if (channelInfo !== exist.channelInfo) {
                console.log('EQ', channelInfo !== exist.channelInfo);
                exist = await downloadService.updateById(exist._id, {
                    channelInfo
                });
                await downloadImageAndText(
                    videoInfo,
                    channelInfo,
                    downloadService
                );
                return exist
            }
        } else {
            exist = await downloadService.create({
                id: channelInfo.channelId,
                channelInfo
            });
            await downloadImageAndText(videoInfo, channelInfo, downloadService);
            return exist
        }
        return exist;
    } catch (error) {
        throw Exception.create(error.message);
    }
};

const downloadImageAndText = async (
    videoInfo: IVideoInfo,
    channelInfo: IChannelInfo,
    downloadService: DownloadService
): Promise<void> => {
    try {
        const { outputText, outputImage } = await outputPaths(videoInfo);

        await downloadService.downloadImage(
            channelInfo.thumbnails[channelInfo.thumbnails.length - 1].url,
            outputImage
        );
        await downloadService.saveInfoTxt(channelInfo, outputText);
    } catch (error) {
        throw Exception.create(error.message);
    }
};
