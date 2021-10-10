import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import { UserMnemonic } from './models/user.mnemonic';
import { UserAddress } from './models/user.address.entity';
import { Token } from '../auth/models/token.model';
import * as bcryptjs from 'bcryptjs';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { Asset } from '../chain-abstraction/models/asset.entity';
import { generateMnemonic } from 'bip39';
import { ChainClientService } from '../chain-abstraction/chain-client-service';
import { getDerivationPath } from '../chain-abstraction/utils/derivationPath';
import { assets as cryptoassets, chains } from '@liquality/cryptoassets';
import { isEthereumChain } from '../chain-abstraction/utils/asset';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly chainClientService: ChainClientService,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Token) private tokenModel: typeof Token,
    @InjectModel(Asset) private assetModel: typeof Asset,
    @InjectModel(UserAddress) private userAddressModel: typeof UserAddress,
    @InjectModel(UserMnemonic) private userMnemonicModel: typeof UserMnemonic,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingAccount = await this.userModel.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (existingAccount) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email has already been used',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hash = await bcryptjs.hash(
      createUserDto.password,
      parseInt(process.env.PASSWORD_SALT),
    );

    const createdUser = await this.userModel.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hash,
      email: createUserDto.email,
    });
    const token = authenticator.generate(
      this.configService.get('TOKEN_GENERATOR_SECRET'),
    );
    await this.tokenModel.create({
      userId: createdUser.id,
      token: token,
      purpose: 'ACTIVATE_ACCOUNT',
      expiration: moment()
        .add(this.configService.get('TOKENS_LIFETIME_IN_MINUTES'), 'minutes')
        .toDate(),
    });
  }
  private async initNewUserAccount(userId: string) {
    const createdUser = await this.userModel.findOne({
      where: {
        id: userId,
      },
    });
    if (createdUser) {
      await this.userMnemonicModel.create({
        userId: createdUser.id,
        mnemonic: generateMnemonic(),
      });
      await this.generateAddresses(userId);
    }
  }
  public async generateAddresses(userId: string) {
    const createdUser = await this.userModel.findOne({
      where: {
        id: userId,
      },
    });
    const userMnemonic = await this.userMnemonicModel.findOne({
      where: {
        userId,
      },
    });
    if (createdUser && userMnemonic) {
      const supportedAssets = await this.assetModel.findAll({
        where: {
          isEnable: true,
        },
      });
      for (const asset of supportedAssets) {
        const assetCode = asset.code;
        const network = this.configService.get('APP_NETWORK');
        const mnemonic = userMnemonic.mnemonic;
        const index = parseInt(this.configService.get('DERIVATION_INDEX'));
        const { chain } = cryptoassets[assetCode];
        const derivationPath = getDerivationPath(
          chain,
          network,
          index,
          'default',
        );

        const client = this.chainClientService.createClient(
          assetCode,
          network,
          mnemonic,
          derivationPath,
        );
        const addresses = await client.wallet.getAddresses();
        const result = addresses[0];
        const address = isEthereumChain(assetCode)
          ? result.address.replace('0x', '')
          : result.address;

        const formattedAddress =
          chains[cryptoassets[assetCode]?.chain]?.formatAddress(address);

        const existing = await this.userAddressModel.findOne({
          where: {
            userId,
            assetId: asset.id,
          },
        });
        if (!existing) {
          await this.userAddressModel.create({
            userId,
            assetId: asset.id,
            address: formattedAddress,
          });
        }
      }
    }
  }

  async activateAccount(token: string, userId: string) {
    const existingToken = await this.tokenModel.findOne({
      where: {
        userId,
        token,
      },
    });
    if (existingToken && existingToken.expiration) {
      await this.userModel.update(
        {
          isActive: true,
        },
        {
          where: {
            id: userId,
          },
        },
      );
    }
  }
}
