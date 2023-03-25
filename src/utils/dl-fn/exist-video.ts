import { IVideoInfo } from 'src/interfaces/downloads.interface';
import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { Exception } from '../error/exception-handler';

export const existVideo = async (
    exist: Download,
    videoInfo: IVideoInfo,
    downloadService: DownloadService
) => {
    try {
        const { videoId } = videoInfo;
        const existVideo = exist.downloads.find((e) => e.videoId === videoId);

        if (!existVideo) {
            const filePath = await downloadService.downloadVideo(videoInfo);
            exist.downloads.push({
                videoId,
                filePath,
                videoInfo
            });

            await downloadService.updateById(exist._id, {
                downloads: exist.downloads
            });

            return exist.downloads;
        }

        return [existVideo];
    } catch (error) {
        throw Exception.catch(error.message);
    }
};
