import { Test, TestingModule } from '@nestjs/testing';
import { DichVuService } from './dich-vu.service';

describe('DichVuService', () => {
  let service: DichVuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DichVuService],
    }).compile();

    service = module.get<DichVuService>(DichVuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
