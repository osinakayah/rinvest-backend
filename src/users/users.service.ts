import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.entity';

@Injectable()
export class UsersService {
  async register(createUserDto: CreateUserDto): Promise<undefined | void> {
    // this.userModel.create({
    //   password: createUserDto.password,
    //   name: createUserDto.name,
    //   email: '',
    //   gender: '',
    // });
  }
}
