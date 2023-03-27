import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { DownloadService } from 'src/modules/download/download.service';
import { DownloadDocument } from 'src/modules/download/schema/download.schema';
import { outputTextImagePath } from '../ytdl-paths';

export const createChannel = async (
    channelId: string,
    outputFolder: string,
    googleService: GoogleapiService,
    downloadService: DownloadService
): Promise<DownloadDocument> => {
    const channelInfo = await googleService.getChannelInfo(channelId);

    const { outputImage, outputText } = await outputTextImagePath(
        channelInfo,
        outputFolder
    );

    await downloadService.downloadTextAndImage(
        channelInfo.thumbnails.high.url,
        outputImage,
        channelInfo,
        outputText
    );

    return await downloadService.create({
        id: channelId,
        channelInfo,
        downloads: []
    });
};

export const updateChannelInfo = async (
    exist: DownloadDocument,
    channelInfo: IChannelInfo,
    outputFolder: string,
    downloadService: DownloadService
): Promise<DownloadDocument> => {
    if (JSON.stringify(channelInfo) !== JSON.stringify(exist.channelInfo)) {
        const { outputImage, outputText } = await outputTextImagePath(
            channelInfo,
            outputFolder
        );

        await downloadService.downloadTextAndImage(
            channelInfo.thumbnails.high.url,
            outputImage,
            channelInfo,
            outputText
        );

        exist = await downloadService.updateById(exist._id, {
            channelInfo
        });
    }
    return exist;
};

export const getDownloadedVideos = async (
    exist: DownloadDocument
): Promise<string[]> => exist.downloads.map((video) => video.videoId);

export const getVideosToDownload = async (
    exist: DownloadDocument,
    googleService: GoogleapiService
): Promise<IVideoInfo[]> => {
    const downloadedIds = exist.downloads.map((video) => video.videoId);
    const allIdsChannel = await googleService.getAllVideosFromChannel(exist.id);

    const videosToDownload: IVideoInfo[] = [];

    for (const id of allIdsChannel) {
        if (downloadedIds.includes(id)) continue;
        videosToDownload.push(await googleService.getVideoInfo(id));
    }

    return videosToDownload;
};
