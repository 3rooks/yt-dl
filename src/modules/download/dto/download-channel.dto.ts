import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DownloadChannelDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    public readonly clientId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUrl()
    public readonly channelUrl: string;
}
