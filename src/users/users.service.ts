import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import sequelize from 'sequelize';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingAccount = await this.userModel.findOne({
      where: {
        [sequelize.Op.or]: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      },
    });
    if (existingAccount && existingAccount.email === createUserDto.email) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email has already been used',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else if (
      existingAccount &&
      existingAccount.username === createUserDto.username
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Username has already been used',
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
      username: createUserDto.username,
      password: hash,
      email: createUserDto.email,
    });
  }
}
