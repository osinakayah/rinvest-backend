import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserAddress } from '../users/models/user.address.entity';

import { Asset } from '../chain-abstraction/models/asset.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(UserAddress) private userAddress: typeof UserAddress,
    @InjectModel(Asset) private assetModel: typeof Asset,
  ) {}

  getUserAddresses(userId: string) {
    return this.userAddress.findAll({
      where: {
        userId,
      },
      include: [
        {
          as: 'asset',
          model: this.assetModel,
          attributes: ['name', 'code'],
        },
      ],
      attributes: ['address'],
    });
  }
}
