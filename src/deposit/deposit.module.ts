import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Asset } from '../chain-abstraction/models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';
import { UserAssetBalance } from '../users/models/user.asset.balance';
import { DepositController } from './deposit.controller';
import { Transactions } from '../users/models/transaction.entity';

@Module({
  providers: [DepositService],
  imports: [
    SequelizeModule.forFeature([
      UserAddress,
      UserAssetBalance,
      Asset,
      Transactions,
    ]),
  ],
  controllers: [DepositController],
})
export class DepositModule {}
