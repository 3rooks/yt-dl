import { PartialType } from '@nestjs/mapped-types';
import { FormatDownloadDto } from './format-download.dto';

export class UpdateDownloadDto extends PartialType(FormatDownloadDto) {}
