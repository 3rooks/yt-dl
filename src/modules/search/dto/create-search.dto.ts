import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateSearchDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsUrl()
    readonly url: string;
}
