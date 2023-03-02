import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DlService } from './dl.service';
import { CreateDlDto } from './dto/create-dl.dto';
import { UpdateDlDto } from './dto/update-dl.dto';

@Controller('dl')
export class DlController {
  constructor(private readonly dlService: DlService) {}

  @Post()
  create(@Body() createDlDto: CreateDlDto) {
    return this.dlService.create(createDlDto);
  }

  @Get()
  findAll() {
    return this.dlService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dlService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDlDto: UpdateDlDto) {
    return this.dlService.update(+id, updateDlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dlService.remove(+id);
  }
}
