import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/models/user.entity';
import { Token } from './auth/models/token.model';
import { Asset } from './chain-abstraction/models/asset.entity';
import { AssetNairaRate } from './asset-rates/models/naira-rate';
import { UserAddress } from './users/models/user.address.entity';
import { AddressModule } from './address/address.module';
import { NotificationModule } from './notification/notification.module';
import { MailModule } from './mail/mail.module';
import { StakingModule } from './staking/staking.module';
import { UserMnemonic } from './users/models/user.mnemonic';
import { ChainAbstractionModule } from './chain-abstraction/chain-abstraction.module';
import { InvestmentModule } from './investment/investment.module';
import { UserInvestment } from './users/models/user.investment.entity';
import { AssetRatesModule } from './asset-rates/asset-rates.module';
import { DepositModule } from './deposit/deposit.module';
import { InvestmentAddress } from './investment/models/investment.address.entity';
import { Transactions } from './users/models/transaction.entity';
import { UserAssetBalance } from './users/models/user.asset.balance';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME_DEVELOPMENT,
      models: [
        AssetNairaRate,
        Asset,
        InvestmentAddress,
        Token,
        Transactions,
        UserAddress,
        UserAssetBalance,
        UserMnemonic,
        UserInvestment,
        User,
      ],
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    AddressModule,
    NotificationModule,
    MailModule,
    StakingModule,
    ChainAbstractionModule,
    InvestmentModule,
    AssetRatesModule,
    DepositModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
