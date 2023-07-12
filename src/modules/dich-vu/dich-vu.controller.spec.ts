import { Test, TestingModule } from '@nestjs/testing';
import { DichVuController } from './dich-vu.controller';

describe('DichVuController', () => {
  let controller: DichVuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DichVuController],
    }).compile();

    controller = module.get<DichVuController>(DichVuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
