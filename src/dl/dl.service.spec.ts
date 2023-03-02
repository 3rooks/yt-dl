import { Test, TestingModule } from '@nestjs/testing';
import { DlService } from './dl.service';

describe('DlService', () => {
  let service: DlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DlService],
    }).compile();

    service = module.get<DlService>(DlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
