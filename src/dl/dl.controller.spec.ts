import { Test, TestingModule } from '@nestjs/testing';
import { DlController } from './dl.controller';
import { DlService } from './dl.service';

describe('DlController', () => {
  let controller: DlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DlController],
      providers: [DlService],
    }).compile();

    controller = module.get<DlController>(DlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
