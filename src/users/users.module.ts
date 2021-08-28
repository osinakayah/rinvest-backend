import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.entity';
import { UsersService } from './users.service';
import { usersProviders } from './users.providers';

@Module({
  // imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService, ...usersProviders],
  exports: [UsersService],
})
export class UsersModule {}
