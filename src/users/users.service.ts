import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel) private userModel: typeof UserModel) {}

  register(createUserDto: CreateUserDto): Promise<UserModel> {
    return this.userModel.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: createUserDto.password,
      phoneNumber: createUserDto.phoneNumber,
      username: createUserDto.username,
    });
  }
}
