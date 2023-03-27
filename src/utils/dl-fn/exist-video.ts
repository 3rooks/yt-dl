import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { Exception } from '../error/exception-handler';
import { OUTPUT_PATH } from '../paths.resource';

export const existVideo = async (
    exist: Download,
    videoInfo: IVideoInfo,
    downloadService: DownloadService
) => {
    try {
        const { videoId } = videoInfo;
        const existVideo = exist.downloads.find((e) => e.videoId === videoId);

        if (!existVideo) {
            const filePath = await downloadService.downloadVideo(
                videoInfo,
                OUTPUT_PATH
            );

            exist.downloads.push({
                videoId,
                filePath,
                videoInfo
            });

            await downloadService.updatedDownloadsById(
                exist._id,
                exist.downloads
            );

            return filePath;
        }

        return existVideo.filePath;
    } catch (error) {
        throw Exception.catch(error.message);
    }
};
