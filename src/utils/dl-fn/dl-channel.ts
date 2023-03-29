import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { DownloadService } from 'src/modules/download/download.service';
import { DownloadDocument } from 'src/modules/download/schema/download.schema';
import { Exception } from '../error/exception-handler';
import { outputTextImagePath } from '../ytdl-paths';

export const createChannel = async (
    channelId: string,
    outputFolder: string,
    googleService: GoogleapiService,
    downloadService: DownloadService
): Promise<DownloadDocument> => {
    try {
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
    } catch (error) {
        throw Exception.catch(error.message);
    }
};

export const updateChannelInfo = async (
    exist: DownloadDocument,
    channelId: string,
    outputFolder: string,
    downloadService: DownloadService,
    googleService: GoogleapiService
): Promise<DownloadDocument> => {
    try {
        const channelInfo = await googleService.getChannelInfo(channelId);

        if (channelInfo !== exist.channelInfo) {
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
    } catch (error) {
        throw Exception.catch(error.message);
    }
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
        const videoInfo = await googleService.getVideoInfo(id);
        if (!videoInfo) continue;
        videosToDownload.push(videoInfo);
    }

    return videosToDownload;
};
