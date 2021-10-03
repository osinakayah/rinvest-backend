import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import { UserMnemonic } from './models/user.mnemonic';
import { Token } from '../auth/models/token.model';
import * as bcryptjs from 'bcryptjs';
import { authenticator } from 'otplib';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { generateMnemonic } from 'bip39';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Token) private tokenModel: typeof Token,
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
      const createdUserMnemonic = await this.userMnemonicModel.create({
        userId: createdUser.id,
        mnemonic: generateMnemonic(),
      });
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
