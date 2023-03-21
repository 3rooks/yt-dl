import {
    BadRequestException,
    Body,
    Controller,
    InternalServerErrorException,
    Post
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleapiService } from 'src/lib/googleapi/googleapi.service';
import { getInfo, getVideoID, validateURL } from 'ytdl-core';
import { DownloadService } from './download.service';
import { DownloadChannelDto } from './dto/download-channel.dto';
import { DownloadVideoDto } from './dto/download-video.dto';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
    constructor(
        private readonly downloadService: DownloadService,
        private readonly googleService: GoogleapiService
    ) {}

    @Post('video')
    async download(@Body() { url }: DownloadVideoDto) {
        try {
            // Validamos la url
            const isValid = validateURL(url);
            if (!isValid) return new BadRequestException('INVALID_YOUTUBE_URL');

            // obtenemos la informacion
            const videoId = getVideoID(url);
            const { videoDetails } = await getInfo(url);
            const { author, channelId } = videoDetails;

            // verificamos si ya existe el canal
            const exist = await this.downloadService.getByChannelId(channelId);

            // si NO existe el canal
            if (!exist) {
                // creamos un documento de download
                const cre = await this.downloadService.create({
                    authorInfo: author,
                    channelId
                });

                // descargamos el video
                const output = await this.downloadService.downloadVideo(url);

                // guardamos la info del video

                // pusheamos la info del video al documento
                cre.downloads.push({
                    filePath: output,
                    videoId,
                    videoDetails
                });

                // guardamos la informacion
                await this.downloadService.updateById(cre._id, cre);

                // retornamos el array de videos descargados
                return cre.downloads;
            }

            // si existe el canal, buscamos si existe el video
            const existVideo = exist.downloads.find(
                (e) => e.videoId === videoId
            );

            // si no existe el video
            if (!existVideo) {
                // descargamos el video
                const output = await this.downloadService.downloadVideo(url);

                // creamos la info del video

                // pusheamos la info del video al documento
                exist.downloads.push({
                    filePath: output,
                    videoDetails,
                    videoId
                });

                // actualizamos el documento
                await this.downloadService.updateById(exist._id, exist);

                // retornamos el array de descargas
                return exist.downloads;
            }

            // si existe el canal y el video, retornamos el array de descargas
            return exist.downloads;
        } catch (error) {
            throw new InternalServerErrorException(
                `[POST]/video: ${error.message} - ${error.stack}`
            );
        }
    }

    @Post('channel')
    async downloadChannel(@Body() { channelUrl }: DownloadChannelDto) {
        const channelId = await this.googleService.getChannelIdFromUrl(
            channelUrl
        );
        const videoIds = await this.googleService.getVideosFromChannel(
            channelId
        );
        console.log(videoIds.length);

            









        return videoIds;
    }
}
