import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    return this.userModel.create({
      password: 'password',
      email: 'email',
      gender: 'female',
    });
  }
}
