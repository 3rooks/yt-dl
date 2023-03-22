import { DownloadService } from 'src/modules/download/download.service';
import { DownloadItem } from 'src/modules/download/schema/download-items.schema';
import { Download } from 'src/modules/download/schema/download.schema';
import { MoreVideoDetails } from 'ytdl-core';

export const existVideo = async (
    exist: Download,
    videoDetails: MoreVideoDetails,
    downloadService: DownloadService
): Promise<DownloadItem[]> => {
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
};
