import { Module } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Asset } from '../chain-abstraction/models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';
import { UserAssetBalance } from '../users/models/user.asset.balance';

@Module({
  providers: [DepositService],
  imports: [SequelizeModule.forFeature([UserAddress, UserAssetBalance, Asset])],
})
export class DepositModule {}
