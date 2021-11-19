import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AddressController } from './address.controller';
import { Asset } from '../chain-abstraction/models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';

@Module({
  imports: [SequelizeModule.forFeature([UserAddress, Asset])],
  providers: [AddressService],
  controllers: [AddressController],
})
export class AddressModule {}
