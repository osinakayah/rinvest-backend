import { Injectable } from '@nestjs/common';
import {
  assets as cryptoassets,
  unitToCurrency,
} from '@liquality/cryptoassets';
import BN from 'bignumber.js';
import { InjectModel } from '@nestjs/sequelize';
import { Asset } from './models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';
import { UserMnemonic } from '../users/models/user.mnemonic';
import { ChainClientService } from './chain-client-service';
import { AssetNairaRate } from '../asset-rates/models/naira-rate';
import { UserAssetBalance } from '../users/models/user.asset.balance';
import { prettyBalance } from './utils/coinFormatter';

@Injectable()
export class ChainAbstractionService {
  constructor(
    private readonly chainClientService: ChainClientService,

    @InjectModel(Asset) private assetModel: typeof Asset,
    @InjectModel(UserAddress) private userAddressModel: typeof UserAddress,
    @InjectModel(UserMnemonic) private userMnemonicModel: typeof UserMnemonic,
    @InjectModel(UserAssetBalance)
    private userAssetBalance: typeof UserAssetBalance,
    @InjectModel(AssetNairaRate)
    private assetNairaRateModel: typeof AssetNairaRate,
  ) {}

  async getAvailableCoinsReport(userId: string, fiatCode = 'NGN') {
    const availableCoinsReport = {
      sum: '0',
      assets: [],
    };

    const userAssetBalances = await this.userAssetBalance.findAll({
      where: {
        userId,
      },
      include: [
        {
          as: 'asset',
          model: this.assetModel,
          attributes: ['name', 'code', 'id'],
        },
      ],
    });

    const numberOfAssetBalances = userAssetBalances.length;

    let sumBalance = new BN(0);
    for (let i = 0; i < numberOfAssetBalances; i++) {
      const singleAssetBalance = userAssetBalances[i];

      const addressModel = await this.userAddressModel.findOne({
        where: {
          userId,
          assetId: singleAssetBalance.assetId,
        },
        attributes: ['address'],
      });
      if (addressModel) {
        const singleAsset = {
          id: singleAssetBalance.assetId,
          code: singleAssetBalance.asset.code,
          name: singleAssetBalance.asset.name,
          address: addressModel.address,
          balance: singleAssetBalance.balance,
          fiatBalance: '0',
        };

        const currencyBalance = new BN(singleAssetBalance.balance);

        const rates = await this.assetNairaRateModel.findOne({
          where: {
            baseAsset: fiatCode,
          },
          attributes: ['rates'],
        });
        if (rates && rates.rates[singleAssetBalance.asset.code]) {
          const r = currencyBalance.dividedBy(
            rates.rates[singleAssetBalance.asset.code],
          );
          singleAsset.fiatBalance = `${r.toFormat(
            2,
            BN.ROUND_CEIL,
          )} ${fiatCode}`;
          sumBalance = sumBalance.plus(r);
        }
        availableCoinsReport.assets.push(singleAsset);
      }
    }
    availableCoinsReport.sum = sumBalance.toFormat(2, BN.ROUND_CEIL);

    return availableCoinsReport;
  }
}
