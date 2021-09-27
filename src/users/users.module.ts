import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import { Token } from '../auth/models/token.model';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User, Token])],
  providers: [UsersService],
  exports: [UsersService, SequelizeModule],
})
export class UsersModule {}
