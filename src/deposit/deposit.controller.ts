import { Body, Controller, Post, Request } from '@nestjs/common';
import { CoinDepositDto } from './dto/coin.deposit.dto';
import { DepositService } from './deposit.service';

@Controller('deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}
  @Post('')
  async onDepositMade(@Request() req, @Body() createUserDto: CoinDepositDto) {
    console.log(createUserDto);
    await this.depositService.parseDepositFromExternalService(createUserDto);
  }
}
