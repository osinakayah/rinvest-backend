import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInvestmentRequestDto } from './dtos/create.investment.request.dto';
import { InjectModel } from '@nestjs/sequelize';
import { UserInvestment } from '../users/models/user.investment.entity';
import { InvestmentAddress } from './models/investment.address.entity';
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

    @InjectModel(InvestmentAddress)
    private investmentAddressModel: typeof InvestmentAddress,
  ) {}
  async getInvestedCoinReport(userId: string, fiatCode = 'NGN') {
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
      const currencyBalance = new BN(singleUserInvestments.amount);

      const singleAsset = {
        id: singleUserInvestments.asset.id,
        code: singleUserInvestments.asset.code,
        name: singleUserInvestments.asset.name,
        address: '',
        balance: singleUserInvestments.amount,
        fiatBalance: '0',
      };
      if (rates && rates.rates[singleUserInvestments.asset.code]) {
        const r = currencyBalance.dividedBy(
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
      {
        attributes: ['id', 'code'],
      },
    );
    const userMnemonic = await this.userMnemonic.findOne({
      where: {
        userId,
      },
      attributes: ['mnemonic'],
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
          to: await this.getInvestmentTransferAddress(assetToInvest.id),
          value: new BN(amount),
        });
        if (txHash) {
          await this.userInvestmentModel.create({
            userId,
            assetId: assetToInvest.id,
            amount: amount.toString(),
          });
        }
      } catch (e) {
        console.log(e);
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Investment failed, please try again later',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Asset not found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async getInvestmentTransferAddress(assetId: string): Promise<string> {
    // INSERT INTO public."AssetNairaRates" ("baseAsset", "rates", "createdAt", "updatedAt")VALUES('NGN','{"BTC":"3.9e-8","ETH":"5.9e-7"}', now(), now());
    const investmentAddress = await this.investmentAddressModel.findOne({
      where: {
        assetId,
      },
    });
    if (investmentAddress) {
      return investmentAddress.address;
    }
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'Investment failed, please try again later',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
