import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class FormatDownloadDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUrl()
    public readonly url: string;
}
