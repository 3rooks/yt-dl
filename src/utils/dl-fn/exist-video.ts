import { IVideoInfo } from 'src/interfaces/video-info.interface';
import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { VideoDownload } from 'src/modules/download/schema/video-download.schema';
import { Exception } from '../error/exception-handler';

export const existVideo = async (
    exist: Download,
    videoInfo: IVideoInfo,
    downloadService: DownloadService
): Promise<VideoDownload[]> => {
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
            await downloadService.updateById(exist._id, exist);
            return exist.downloads;
        }

        return [existVideo];
    } catch (error) {
        throw Exception.create(error.message);
    }
};
