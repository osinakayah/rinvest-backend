import { Module } from '@nestjs/common';
import { ChainClientService } from './chain-client-service';
import { ChainAbstractionService } from './chain-abstraction.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/models/user.entity';
import { UserMnemonic } from '../users/models/user.mnemonic';
import { Asset } from './models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserMnemonic, Asset, UserAddress]),
  ],
  providers: [ChainClientService, ChainAbstractionService],
  exports: [ChainClientService, ChainAbstractionService],
})
export class ChainAbstractionModule {}
