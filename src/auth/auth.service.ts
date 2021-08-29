import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dtos/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/models/user.entity';
import sequelize from 'sequelize';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({
      where: {
        [sequelize.Op.or]: [{ email: username }, { username: username }],
      },
      attributes: ['email', 'password'],
    });

    if (user) {
      const isMatch = await bcryptjs.compare(pass, user.password);
      if (isMatch) {
        return user;
      }
    }
    return null;
  }
  async login(user: User) {
    const payload = { username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
