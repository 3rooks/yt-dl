import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { getInfo, getVideoID } from 'ytdl-core';
import { InfoService } from '../info/info.service';
import { DownloadService } from './download.service';
import { DownloadVideoDto } from './dto/download-video.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly downloadService: DownloadService,
        private readonly infoService: InfoService
    ) {}

    @Post('video')
    async download(@Body() { url }: DownloadVideoDto, @Res() res: Response) {
        try {
            const { videoDetails } = await getInfo(url);
            const { author, channelId } = videoDetails;

            const exist = await this.downloadService.getByChannelId(channelId);
            if (exist) {
                const videoId = getVideoID(url);
                const file = await this.downloadService.getVideoById(
                    channelId,
                    videoId
                );

                console.log(file);
                if (!file) {
                    const filePath = await this.downloadService.downloadVideo(
                        url
                    );

                    const doc = await this.downloadService.getByChannelId(
                        channelId
                    );

                    const vid = await this.infoService.createInfo(videoDetails);

                    doc.downloads.push({
                        filePath,
                        videoId,
                        videoDetails: vid._id
                    });

                    await this.downloadService.updateById(doc._id, doc);

                    return res.sendFile(filePath);
                }
                return res.sendFile(file);
            }

            const videoId = getVideoID(url);
            const outputFile = await this.downloadService.downloadVideo(url);
            const b = await this.downloadService.create({
                channelId,
                authorInfo: author
            });
            const a = await this.infoService.createInfo(videoDetails);
            b.downloads.push({
                filePath: outputFile,
                videoId,
                videoDetails: a._id
            });

            return res.sendFile(outputFile);
        } catch (error) {
            throw new Error(`[POST]Video: ${error.message} - ${error.stack}`);
        }
    }
}
