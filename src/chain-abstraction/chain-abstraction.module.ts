import { Module } from '@nestjs/common';
import { ChainAbstractionService } from './chain-abstraction.service';

@Module({
  providers: [ChainAbstractionService],
  exports: [ChainAbstractionService],
})
export class ChainAbstractionModule {}
