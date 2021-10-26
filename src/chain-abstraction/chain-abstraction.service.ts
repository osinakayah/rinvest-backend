import { Injectable } from '@nestjs/common';
import {
  assets as cryptoassets,
  unitToCurrency,
} from '@liquality/cryptoassets';
import { ConfigService } from '@nestjs/config';
import BN from 'bignumber.js';
import { InjectModel } from '@nestjs/sequelize';
import { Asset } from './models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';
import { UserMnemonic } from '../users/models/user.mnemonic';
import { ChainClientService } from './chain-client-service';
import { AssetNairaRate } from '../asset-rates/models/naira-rate';
import { prettyBalance } from './utils/coinFormatter';

@Injectable()
export class ChainAbstractionService {
  constructor(
    private readonly chainClientService: ChainClientService,

    @InjectModel(Asset) private assetModel: typeof Asset,
    @InjectModel(UserAddress) private userAddressModel: typeof UserAddress,
    @InjectModel(UserMnemonic) private userMnemonicModel: typeof UserMnemonic,
    @InjectModel(AssetNairaRate)
    private assetNairaRateModel: typeof AssetNairaRate,
  ) {}

  async getAvailableCoinsReport(userId: string, fiatCode = 'NGN') {
    const availableCoinsReport = {
      sum: '0',
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

    if (userMnemonic) {
      let sumBalance = new BN(0);
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];

        const client = this.chainClientService.createClient(
          address.asset.code,
          userMnemonic.mnemonic,
        );
        const balance =
          addresses.length === 0
            ? 0
            : (await client.chain.getBalance([address.address])).toNumber();

        const currencyBalance = unitToCurrency(
          cryptoassets[address.asset.code],
          balance,
        );
        const singleAsset = {
          code: address.asset.code,
          name: address.asset.name,
          address: address.address,
          balance: prettyBalance(balance, address.asset.code),
          fiatBalance: '0',
        };

        const rates = await this.assetNairaRateModel.findOne({
          where: {
            baseAsset: fiatCode,
          },
          attributes: ['rates'],
        });
        if (rates && rates.rates[address.asset.code]) {
          const r = new BN(currencyBalance).dividedBy(
            rates.rates[address.asset.code],
          );
          singleAsset.fiatBalance = `${r.toFormat(
            2,
            BN.ROUND_CEIL,
          )} ${fiatCode}`;
          sumBalance = sumBalance.plus(r);
        }
        availableCoinsReport.assets.push(singleAsset);
      }
      availableCoinsReport.sum = sumBalance.toFormat(2, BN.ROUND_CEIL);
    }

    return availableCoinsReport;
  }
}
