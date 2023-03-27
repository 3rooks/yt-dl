import { IChannelInfo } from 'src/interfaces/channel-info.interface';
import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { RANDOM_PATH } from '../paths.resource';
import { outputTextImagePath } from '../ytdl-paths';

export const createChannel = async (
    channelId: string,
    downloadService: DownloadService,
    googleService: GoogleapiService
): Promise<Download> => {
    const channelInfo = await googleService.getChannelInfo(channelId);

    const { outputImage, outputText } = await outputTextImagePath(
        channelInfo,
        RANDOM_PATH
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

export const changeChannelInfo = async (
    exist: Download,
    channelInfo: IChannelInfo,
    downloadService: DownloadService,
    outputFolder: string
) => {
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

export const updateChannelInfo = async (
    exist: Download,
    channelId: string,
    downloadService: DownloadService,
    googleService: GoogleapiService
) => {
    const channelInfo = await googleService.getChannelInfo(channelId);
    return await downloadService.changeChannelInfo(exist, channelInfo);
};

export const getDownloadedVideos = async (exist: Download) => {
    return exist.downloads.map((download) => download.videoId);
};

export const getVideosToDownload = async (
    videoIds: string[],
    downloadedVideos: string[],
    googleService: GoogleapiService
) => {
    const videosToDownload: IVideoInfo[] = [];

    for (const id of videoIds) {
        if (downloadedVideos.includes(id)) continue;
        const videoInfo = await googleService.getVideoInfo(id);
        videosToDownload.push(videoInfo);
    }

    return videosToDownload;
};

export const downloadVideos = async (
    videoInfos: IVideoInfo[],
    downloadService: DownloadService
) => {
    const downloads = await downloadService.downloadVideos(videoInfos);
    return downloads;
};
