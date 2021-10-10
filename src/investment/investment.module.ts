import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';

@Module({
  providers: [InvestmentService],
  exports: [InvestmentService],
})
export class InvestmentModule {}
