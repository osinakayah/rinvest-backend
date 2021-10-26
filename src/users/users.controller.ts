import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvestmentService } from '../investment/investment.service';
import { ChainAbstractionService } from '../chain-abstraction/chain-abstraction.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly chainAbstractionService: ChainAbstractionService,
    private readonly investmentService: InvestmentService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('home')
  async getHomeReport(@Request() req) {
    const availableCoinsReport =
      await this.chainAbstractionService.getAvailableCoinsReport(req.user.id);

    const investedCoinReport =
      await this.investmentService.getInvestedCoinReport(req.user.id);

    return {
      availableCoinsReport,
      investedCoinReport,
    };
  }
}
