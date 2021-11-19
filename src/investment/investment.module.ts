import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { ChainAbstractionModule } from '../chain-abstraction/chain-abstraction.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserInvestment } from '../users/models/user.investment.entity';
import { Asset } from '../chain-abstraction/models/asset.entity';
import { UserMnemonic } from '../users/models/user.mnemonic';
import { AssetNairaRate } from '../asset-rates/models/naira-rate';

@Module({
  providers: [InvestmentService],
  exports: [InvestmentService],
  controllers: [InvestmentController],
  imports: [
    ChainAbstractionModule,
    SequelizeModule.forFeature([
      UserInvestment,
      Asset,
      UserMnemonic,
      AssetNairaRate,
    ]),
  ],
})
export class InvestmentModule {}
