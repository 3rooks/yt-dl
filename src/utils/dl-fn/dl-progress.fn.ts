import { DownloadProgress } from 'src/interfaces/download-progress.interface';
import { DownloadGateway } from 'src/lib/websocket/download-gateway.service';
import { Readable } from 'stream';
import { videoFormat } from 'ytdl-core';

export const emitDownloadProgress = (
    clientId: string,
    bestAudio: videoFormat,
    bestVideo: videoFormat,
    audioReadable: Readable,
    videoReadable: Readable,
    downloadGateway: DownloadGateway
) => {
    let downloadedBytes = 0;
    const totalSize = +bestAudio.contentLength + +bestVideo.contentLength;

    audioReadable.on('data', (chunk: any) => {
        downloadedBytes += chunk.length;
        sendProgress(downloadedBytes);
    });

    videoReadable.on('data', (chunk: any) => {
        downloadedBytes += chunk.length;
        sendProgress(downloadedBytes);
    });

    const sendProgress = (downloadedBytes: number) => {
        const progressPercent = Math.floor((downloadedBytes / totalSize) * 100);
        const downloadedMb = downloadedBytes / (1024 * 1024);
        const totalSizeMb = totalSize / (1024 * 1024);

        const progress: DownloadProgress = {
            progress: progressPercent,
            downloaded: downloadedMb,
            totalSize: totalSizeMb
        };

        downloadGateway.downloadProgress(clientId, progress);
    };
};
