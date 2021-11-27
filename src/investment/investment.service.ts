import { Injectable } from '@nestjs/common';
import { CreateInvestmentRequestDto } from './dtos/create.investment.request.dto';
import { InjectModel } from '@nestjs/sequelize';
import { UserInvestment } from '../users/models/user.investment.entity';
import { ChainClientService } from '../chain-abstraction/chain-client-service';
import { Asset } from '../chain-abstraction/models/asset.entity';
import BN from 'bignumber.js';
import {
  assets as cryptoassets,
  currencyToUnit,
} from '@liquality/cryptoassets';
import { dpUI, prettyBalance } from '../chain-abstraction/utils/coinFormatter';

import { UserMnemonic } from '../users/models/user.mnemonic';
import { AssetNairaRate } from '../asset-rates/models/naira-rate';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(UserInvestment)
    private userInvestmentModel: typeof UserInvestment,
    @InjectModel(Asset) private assetModel: typeof Asset,
    @InjectModel(UserMnemonic) private userMnemonic: typeof UserMnemonic,
    private readonly chainClientService: ChainClientService,
    @InjectModel(AssetNairaRate)
    private assetNairaRateModel: typeof AssetNairaRate,
  ) {}
  async getInvestedCoinReport(userId: string, fiatCode = 'NGN') {
    const investedCoinReport = {
      sum: '0',
      assets: [],
    };

    const userInvestments = await this.userInvestmentModel.findAll({
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

    const rates = await this.assetNairaRateModel.findOne({
      where: {
        baseAsset: fiatCode,
      },
      attributes: ['rates'],
    });
    let sumBalance = new BN(0);
    const assets = userInvestments.map((singleUserInvestments) => {
      const currencyBalance = prettyBalance(
        singleUserInvestments.amount,
        singleUserInvestments.asset.code,
      );
      const singleAsset = {
        id: singleUserInvestments.asset.id,
        code: singleUserInvestments.asset.code,
        name: singleUserInvestments.asset.name,
        address: '',
        balance: currencyBalance,
        fiatBalance: '0',
      };
      if (rates && rates.rates[singleUserInvestments.asset.code]) {
        const r = new BN(currencyBalance).dividedBy(
          rates.rates[singleUserInvestments.asset.code],
        );
        singleAsset.fiatBalance = `${r.toFormat(2, BN.ROUND_CEIL)} ${fiatCode}`;
        sumBalance = sumBalance.plus(r);
      }
      return singleAsset;
    });

    return {
      assets,
      sum: sumBalance.toFormat(2, BN.ROUND_CEIL),
    };
  }

  async makeInvestmentForUser(
    userId: string,
    createInvestmentData: CreateInvestmentRequestDto,
  ) {
    const assetToInvest = await this.assetModel.findByPk(
      createInvestmentData.assetId,
    );
    const userMnemonic = await this.userMnemonic.findOne({
      where: {
        userId,
      },
    });
    if (assetToInvest && userMnemonic) {
      const client = this.chainClientService.createClient(
        assetToInvest.code,
        userMnemonic.mnemonic,
      );

      try {
        const quantity = dpUI(createInvestmentData.amount);
        const amount = currencyToUnit(
          cryptoassets[assetToInvest.code],
          quantity,
        ).toNumber();

        const txHash = await client.chain.sendTransaction({
          to: this.getInvestmentTransferAddress(),
          value: new BN(amount),
        });
        if (txHash) {
          await this.userInvestmentModel.create({
            userId,
            assetId: assetToInvest.id,
            amount: amount.toString(),
          });
        }
      } catch (e) {}
    }
  }

  private getInvestmentTransferAddress(): string {
    // INSERT INTO public."AssetNairaRates" ("baseAsset", "rates", "createdAt", "updatedAt")VALUES('NGN','{"BTC":"3.9e-8","ETH":"5.9e-7"}', now(), now());
    return '0xd1dBee4ADC296F2E4c50d4F679058f2823d667a7';
  }
}
