import { Injectable } from '@nestjs/common';
import {
  assets as cryptoassets,
  unitToCurrency,
} from '@liquality/cryptoassets';
import { getDerivationPath } from './utils/derivationPath';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Asset } from './models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';
import { UserMnemonic } from '../users/models/user.mnemonic';
import { ChainClientService } from './chain-client-service';

@Injectable()
export class ChainAbstractionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly chainClientService: ChainClientService,

    @InjectModel(Asset) private assetModel: typeof Asset,
    @InjectModel(UserAddress) private userAddressModel: typeof UserAddress,
    @InjectModel(UserMnemonic) private userMnemonicModel: typeof UserMnemonic,
  ) {}

  async getAvailableCoinsReport(userId: string) {
    const availableCoinsReport = {
      sum: 0,
      assets: [],
    };

    const addresses = await this.userAddressModel.findAll({
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
    });
    const userMnemonic = await this.userMnemonicModel.findOne({
      where: {
        userId,
      },
    });

    const network = this.configService.get('APP_NETWORK');
    const index = parseInt(this.configService.get('DERIVATION_INDEX'));

    if (userMnemonic) {
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];

        const { chain } = cryptoassets[address.asset.code];
        const derivationPath = getDerivationPath(
          chain,
          network,
          index,
          'default',
        );

        const client = this.chainClientService.createClient(
          address.asset.code,
          network,
          userMnemonic.mnemonic,
          derivationPath,
        );
        const balance =
          addresses.length === 0
            ? 0
            : (await client.chain.getBalance([address.address])).toNumber();

        availableCoinsReport.assets.push({
          address: address.address,
          balance: unitToCurrency(cryptoassets[address.asset.code], balance),
        });
      }
    }
    return availableCoinsReport;
  }
}
