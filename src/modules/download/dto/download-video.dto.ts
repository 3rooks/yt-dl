import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    IsUrl
} from 'class-validator';

export class DownloadVideoDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUrl()
    public readonly url: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    public readonly itag: number;
}
