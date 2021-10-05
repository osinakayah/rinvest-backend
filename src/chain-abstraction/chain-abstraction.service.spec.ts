import { Test, TestingModule } from '@nestjs/testing';
import { ChainAbstractionService } from './chain-abstraction.service';

describe('ChainAbstractionService', () => {
  let service: ChainAbstractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChainAbstractionService],
    }).compile();

    service = module.get<ChainAbstractionService>(ChainAbstractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
