import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class FiltersDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    public readonly keys: string[];
}
