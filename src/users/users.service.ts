import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import { Token } from '../auth/models/token.model';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Token) private tokenModel: typeof Token,
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

    await this.userModel.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hash,
      email: createUserDto.email,
    });
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
