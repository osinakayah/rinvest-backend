import { Injectable } from '@nestjs/common';

@Injectable()
export class InvestmentService {
  async getInvestedCoinReport(userId: string) {
    const investedCoinReport = {
      sum: 0,
      assets: [],
    };

    return investedCoinReport;
  }
}
