import { Injectable } from '@nestjs/common';
import { CreateDlDto } from './dto/create-dl.dto';
import { UpdateDlDto } from './dto/update-dl.dto';

@Injectable()
export class DlService {
  create(createDlDto: CreateDlDto) {
    return 'This action adds a new dl';
  }

  findAll() {
    return `This action returns all dl`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dl`;
  }

  update(id: number, updateDlDto: UpdateDlDto) {
    return `This action updates a #${id} dl`;
  }

  remove(id: number) {
    return `This action removes a #${id} dl`;
  }
}
