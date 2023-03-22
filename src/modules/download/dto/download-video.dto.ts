import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DownloadVideoDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUrl()
    public readonly videoUrl: string;
}
