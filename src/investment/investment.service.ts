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
import { dpUI } from '../chain-abstraction/utils/coinFormatter';

import { UserMnemonic } from '../users/models/user.mnemonic';

@Injectable()
export class InvestmentService {
  constructor(
    @InjectModel(UserInvestment)
    private userInvestmentModel: typeof UserInvestment,
    @InjectModel(Asset) private assetModel: typeof Asset,
    @InjectModel(UserMnemonic) private userMnemonic: typeof UserMnemonic,
    private readonly chainClientService: ChainClientService,
  ) {}
  async getInvestedCoinReport(userId: string) {
    const investedCoinReport = {
      sum: '0',
      assets: [],
    };

    return investedCoinReport;
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
    return '0xd1dBee4ADC296F2E4c50d4F679058f2823d667a7';
  }
}
