import { DownloadService } from 'src/modules/download/download.service';
import { Download } from 'src/modules/download/schema/download.schema';
import { VideoDownload } from 'src/modules/download/schema/video-download.schema';
import { MoreVideoDetails } from 'ytdl-core';
import { Exception } from '../error/exception-handler';

export const existVideo = async (
    exist: Download,
    videoDetails: MoreVideoDetails,
    downloadService: DownloadService
): Promise<VideoDownload[]> => {
    try {
        const { videoId } = videoDetails;
        const existVideo = exist.downloads.find((e) => e.videoId === videoId);

        if (!existVideo) {
            const output = await downloadService.downloadVideo(videoDetails);
            exist.downloads.push({
                filePath: output,
                videoDetails,
                videoId
            });
            await downloadService.updateById(exist._id, exist);
            return exist.downloads;
        }

        return [existVideo];
    } catch (error) {
        throw Exception.create(error.message);
    }
};
