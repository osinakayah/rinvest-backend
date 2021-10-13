import { Body, Controller, Request, UseGuards, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInvestmentRequestDto } from './dtos/create.investment.request.dto';
import { InvestmentService } from './investment.service';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNewInvestment(
    @Body() createInvestmentRequestDto: CreateInvestmentRequestDto,
    @Request() req,
  ) {
    return this.investmentService.makeInvestmentForUser(
      req.user.id,
      createInvestmentRequestDto,
    );
  }
}
