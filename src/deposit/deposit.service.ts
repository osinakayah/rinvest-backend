import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Asset } from '../chain-abstraction/models/asset.entity';
import { UserAddress } from '../users/models/user.address.entity';
import { UserAssetBalance } from '../users/models/user.asset.balance';
import BigNumber from 'bignumber.js';
import { Sequelize } from 'sequelize-typescript';
import { CoinDepositDto } from './dto/coin.deposit.dto';
import BN from 'bignumber.js';
import { Transactions } from '../users/models/transaction.entity';

@Injectable()
export class DepositService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Asset) private assetModel: typeof Asset,
    @InjectModel(UserAddress) private userAddressModel: typeof UserAddress,
    @InjectModel(UserAssetBalance)
    private userAssetBalanceModel: typeof UserAssetBalance,
    private sequelize: Sequelize,
    @InjectModel(Transactions) private transactionsModel: typeof Transactions,
  ) {}

  async internalDeposit(
    fromUserId: string,
    toUserId: string,
    assetId: string,
    amount: BigNumber,
  ) {
    const fromAssetOldBalance = await this.userAssetBalanceModel.findOne({
      where: {
        userId: fromUserId,
        assetId,
      },
    });

    if (
      fromAssetOldBalance &&
      new BigNumber(fromAssetOldBalance.balance).gt(amount)
    ) {
      const t = await this.sequelize.transaction();
      try {
        const oldToAssetBalance = await this.userAssetBalanceModel.findOne({
          where: {
            userId: toUserId,
            assetId,
          },
        });
        if (oldToAssetBalance && amount) {
          const previousAmount = new BigNumber(oldToAssetBalance.balance);
          const newAmount = previousAmount.plus(amount).toNumber();

          await this.userAssetBalanceModel.update(
            {
              balance: newAmount.toString(),
            },
            {
              where: {
                id: oldToAssetBalance.id,
              },
              transaction: t,
            },
          );
        } else {
          await this.userAssetBalanceModel.create(
            {
              assetId,
              userId: toUserId,
              balance: amount.toString(),
            },
            { transaction: t },
          );
        }
        const previousAmount = new BigNumber(fromAssetOldBalance.balance);
        const newAmount = previousAmount.minus(amount).toNumber();
        await this.userAssetBalanceModel.update(
          {
            balance: newAmount.toString(),
          },
          {
            where: {
              id: fromAssetOldBalance.id,
            },
            transaction: t,
          },
        );
        await t.commit();
      } catch (e) {
        await t.rollback();
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Oops, an error occurred',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'From user does not have enough balance',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async externalDepositAsset(
    userId: string,
    assetId: string,
    amount: BigNumber,
    coinDepositDto: CoinDepositDto,
  ) {
    const existingTransaction = await this.transactionsModel.findOne({
      where: {
        txHash: coinDepositDto.txHash,
      },
    });
    if (!existingTransaction) {
      const oldAssetBalance = await this.userAssetBalanceModel.findOne({
        where: {
          userId,
          assetId,
        },
      });

      const t = await this.sequelize.transaction();

      if (oldAssetBalance && amount) {
        const previousAmount = new BigNumber(oldAssetBalance.balance);
        const newAmount = previousAmount.plus(amount).toNumber();

        await this.userAssetBalanceModel.update(
          {
            balance: newAmount.toString(),
          },
          {
            where: {
              id: oldAssetBalance.id,
            },
            transaction: t,
          },
        );
        await this.transactionsModel.create(
          {
            userId,
            assetId,
            transactionType: 'DEPOSIT',
            amount: coinDepositDto.amount.toString(),
            destinationAddress: coinDepositDto.address,
            transactionStatus: 'CONFIRMED',
            txHash: coinDepositDto.txHash,
            metaData: {},
            chain: coinDepositDto.chain,
          },
          {
            transaction: t,
          },
        );
      } else {
        await this.userAssetBalanceModel.create({
          assetId,
          userId,
          balance: amount.toString(),
        });
        await this.transactionsModel.create(
          {
            userId,
            assetId,
            transactionType: 'DEPOSIT',
            amount: coinDepositDto.amount.toString(),
            destinationAddress: coinDepositDto.address,
            transactionStatus: 'CONFIRMED',
            chain: coinDepositDto.chain,
            txHash: coinDepositDto.txHash,
            metaData: {},
          },
          {
            transaction: t,
          },
        );
      }
      await t.commit();
    }
  }

  async parseDepositFromExternalService(coinDepositDto: CoinDepositDto) {
    const userAddress = await this.userAddressModel.findOne({
      where: {
        address: coinDepositDto.address,
      },
    });
    if (userAddress) {
      await this.externalDepositAsset(
        userAddress.userId,
        userAddress.assetId,
        new BN(coinDepositDto.amount),
        coinDepositDto,
      );
    }
  }
}
