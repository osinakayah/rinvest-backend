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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({
      where: {
        email,
      },
      attributes: ['email', 'password', 'id'],
    });

    if (user) {
      const isMatch = await bcryptjs.compare(pass, user.password);
      if (isMatch) {
        return {
          id: user.id,
        };
      }
    }
    return null;
  }
  async login(user: User) {
    const payload = { id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
