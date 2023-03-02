import { PartialType } from '@nestjs/mapped-types';
import { CreateDlDto } from './create-dl.dto';

export class UpdateDlDto extends PartialType(CreateDlDto) {}
