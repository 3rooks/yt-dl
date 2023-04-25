import { PartialType } from '@nestjs/swagger';
import { CreateLocalDto } from './download-local-video';

export class UpdateLocalDto extends PartialType(CreateLocalDto) {}
