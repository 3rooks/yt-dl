import { Module } from '@nestjs/common';
import { DownloadGateway } from './download-gateway.service';

@Module({
    providers: [DownloadGateway],
    exports: [DownloadGateway]
})
export class DownloadGatewayModule {}
