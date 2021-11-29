import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import { UserMnemonic } from './models/user.mnemonic';
import { Token } from '../auth/models/token.model';
import { Asset } from '../chain-abstraction/models/asset.entity';
import { UserAddress } from './models/user.address.entity';

import { UsersService } from './users.service';
import { ChainAbstractionModule } from '../chain-abstraction/chain-abstraction.module';
import { UsersController } from './users.controller';
import { InvestmentModule } from '../investment/investment.module';
import { UserAssetBalance } from './models/user.asset.balance';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Token,
      UserMnemonic,
      Asset,
      UserAddress,
      UserAssetBalance,
    ]),
    ChainAbstractionModule,
    InvestmentModule,
  ],
  providers: [UsersService],
  exports: [UsersService, SequelizeModule],
  controllers: [UsersController],
})
export class UsersModule {}
