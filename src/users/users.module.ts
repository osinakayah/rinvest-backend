import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import { UserMnemonic } from './models/user.mnemonic';
import { Token } from '../auth/models/token.model';

import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Token, UserMnemonic])],
  providers: [UsersService],
  exports: [UsersService, SequelizeModule],
})
export class UsersModule {}
